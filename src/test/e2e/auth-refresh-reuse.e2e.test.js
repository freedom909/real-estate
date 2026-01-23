// src/test/e2e/auth-refresh-reuse.e2e.test.js
import { describe, it, expect, beforeAll } from "@jest/globals";
import { createTestContainer } from "../helpers/createTestContainer.js";
import { TOKENS } from "../../../src/shared/container/tokens.js";

describe("E2E: Refresh Token Rotation & Reuse (No Login)", () => {
  let refreshTokenService;
  let tokenService;
  let refreshTokenRepo;

  beforeAll(() => {
    const container = createTestContainer();

    tokenService = container.resolve(TOKENS.auth.tokenService);
    refreshTokenService = container.resolve(
      TOKENS.auth.refreshTokenService
    );
    refreshTokenRepo = container.resolve(
      TOKENS.auth.refreshTokenRepo
    );
  });

  it("should rotate refresh token and detect reuse", async () => {
    const ctx = {
      ip: "127.0.0.1",
      deviceId: "device-1",
      userAgent: "jest",
    };

    const refreshToken = tokenService.signRefreshToken({
      sub: "user-1",
      familyId: "family-1",
      tokenVersion: 0,
      sessionId: "session-1",
      scope: ["user"],
      deviceId: ctx.deviceId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    await refreshTokenRepo.save(refreshToken);

    // first refresh → OK
    const res1 = await refreshTokenService.refreshAccessToken(
      refreshToken,
      ctx
    );

    expect(res1.accessToken).toBeDefined();
    expect(res1.refreshToken).toBeDefined();

    // reuse old refresh token → 💥
    await expect(
      refreshTokenService.refreshAccessToken(refreshToken, ctx)
    ).rejects.toThrow("Refresh token reuse detected");
  });
});
