import { describe, it, expect, jest } from "@jest/globals";
import RefreshTokenService from
  "../../../src/subgraphs/auth/services/refresh/refreshToken.service.js";

describe("Auth Refresh Integration Flow", () => {
  it("should detect refresh token reuse (concurrent)", async () => {
    // -----------------------
    // mocks
    // -----------------------
    const tokenService = {
      verifyRefreshToken: jest.fn(() => ({
        sub: "user-1",
        type: "refresh",
        familyId: "family-1",
        tokenVersion: 0,
        deviceId: "device-1",
      })),
      signRefreshToken: jest.fn(() => "new-refresh"),
      signAccessToken: jest.fn(() => "new-access"),
    };

    let consumed = false;

    const refreshTokenRepo = {
      consume: jest.fn(() => {
        if (consumed) return null;
        consumed = true;
        return { id: "ok" };
      }),
      revokeFamily: jest.fn(),
      save: jest.fn(),
    };

    const userRepo = {
      getTokenVersion: jest.fn(() => 0),
    };

    const loginRiskService = {
      handleRefreshTokenReuse: jest.fn(),
    };

    const service = new RefreshTokenService({
      tokenService,
      refreshTokenRepo,
      userRepo,
      loginRiskService,
    });

    // -----------------------
    // concurrent calls
    // -----------------------
    const results = await Promise.allSettled([
      service.refreshAccessToken("refresh.jwt", {}),
      service.refreshAccessToken("refresh.jwt", {}),
    ]);

    const fulfilled = results.filter(
      (r) => r.status === "fulfilled"
    );
    const rejected = results.filter(
      (r) => r.status === "rejected"
    );

    // -----------------------
    // assertions
    // -----------------------
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    expect(
      loginRiskService.handleRefreshTokenReuse
    ).toHaveBeenCalled();

    expect(refreshTokenRepo.revokeFamily)
      .toHaveBeenCalledWith("family-1");
  });
});
