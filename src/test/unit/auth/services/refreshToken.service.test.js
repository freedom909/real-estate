import RefreshTokenService from "../../../../subgraphs/auth/services/refresh/refreshToken.service.js";

import { describe, it, expect, jest, beforeEach } from "@jest/globals";




describe("RefreshTokenService", () => {
  let service;
  let tokenService;
  let refreshTokenRepo;
  let loginRiskService;
  let userRepo;

  const ctx = {
    ip: "1.1.1.1",
    deviceId: "device-1",
    userAgent: "Chrome",
  };

  const validPayload = {
    type: "refresh",
    sub: "user-1",
    familyId: "family-1",
    tokenVersion: 1,
    sessionId: "session-1",
    scope: ["user"],
    deviceId: "device-1",
    ip: "1.1.1.1",
    userAgent: "Chrome",
  };

  beforeEach(() => {
    tokenService = {
      verifyRefreshToken: jest.fn(),
      signRefreshToken: jest.fn(),
      signAccessToken: jest.fn(),
    };

    refreshTokenRepo = {
      consume: jest.fn(),
      save: jest.fn(),
      revokeFamily: jest.fn(),
      delete: jest.fn(),
      revokeBySession: jest.fn(),
      revokeAllByUser: jest.fn(),
    };

    loginRiskService = {
      handleRefreshTokenReuse: jest.fn(),
    };

    userRepo = {
      getTokenVersion: jest.fn(),
    };

    service = new RefreshTokenService({
      tokenService,
      refreshTokenRepo,
      loginRiskService,
      userRepo,
    });
  });

  describe("refreshAccessToken", () => {
    /**
     * Case 3: refresh token 正常轮转 ⭐⭐⭐⭐
     */
    it("should rotate refresh token and issue new access token", async () => {
      tokenService.verifyRefreshToken.mockReturnValue(validPayload);
      userRepo.getTokenVersion.mockResolvedValue(1);
      refreshTokenRepo.consume.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      tokenService.signRefreshToken.mockReturnValue("new-refresh-token");
      tokenService.signAccessToken.mockReturnValue("new-access-token");

      const result = await await expect(
  Promise.all([
    service.refreshAccessToken(rt, ctx),
    service.refreshAccessToken(rt, ctx),
  ])
).rejects.toThrow();

      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      expect(refreshTokenRepo.consume).toHaveBeenCalledWith("old-refresh-token");
      
      // Verify inheritance of familyId and sessionId
      expect(refreshTokenRepo.save).toHaveBeenCalledWith(
        "new-refresh-token",
        expect.objectContaining({ familyId: "family-1", sessionId: "session-1" })
      );

      expect(tokenService.signAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: "user-1",
          sessionId: "session-1",
        })
      );
    });

    /**
     * Case 1: 非 refresh token ⭐⭐⭐
     */
    it("should throw if token type is not refresh", async () => {
      tokenService.verifyRefreshToken.mockReturnValue({
        ...validPayload,
        type: "access",
      });

      await expect(
        service.refreshAccessToken("token", ctx)
      ).rejects.toThrow("Invalid token type");
    });

    /**
     * Case 2: tokenVersion 不匹配 ⭐⭐⭐
     */
    it("should throw if tokenVersion mismatched", async () => {
      tokenService.verifyRefreshToken.mockReturnValue(validPayload);
      userRepo.getTokenVersion.mockResolvedValue(2);

      await expect(
        service.refreshAccessToken("token", ctx)
      ).rejects.toThrow("Token revoked");
    });

    /**
     * Case 4 & 5: refresh token reuse（并发） & reuse → family/session revoke ⭐⭐⭐⭐⭐
     */
    it("should revoke session (family) and trigger risk when token reuse detected", async () => {
      tokenService.verifyRefreshToken.mockReturnValue(validPayload);
      userRepo.getTokenVersion.mockResolvedValue(1);
      refreshTokenRepo.consume.mockResolvedValue(false);

      await expect(
        service.refreshAccessToken("token", ctx)
      ).rejects.toThrow("Refresh token reuse detected");

      // Note: Implementation uses revokeBySession which covers the "family revoke" requirement
      expect(refreshTokenRepo.revokeBySession).toHaveBeenCalledWith("session-1");
      expect(loginRiskService.handleRefreshTokenReuse).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          familyId: "family-1",
        })
      );
    });
  });

  describe("revoke", () => {
    /**
     * Case 6: revoke(refreshToken) ⭐⭐
     */
    it("should verify and delete the token", async () => {
      const refreshToken = "some-refresh-token";
      const payload = { sub: "user-1", familyId: "family-1" };
      tokenService.verifyRefreshToken.mockReturnValue(payload);

      await service.revoke(refreshToken);

      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(refreshTokenRepo.delete).toHaveBeenCalledWith(refreshToken);
    });

    it("should be idempotent and not throw if token is invalid", async () => {
      const refreshToken = "invalid-token";
      tokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(service.revoke(refreshToken)).resolves.not.toThrow();

      expect(refreshTokenRepo.delete).not.toHaveBeenCalled();
    });

    it("should swallow errors if repo.delete fails (DB error)", async () => {
      const refreshToken = "valid-token";
      tokenService.verifyRefreshToken.mockReturnValue({ sub: "1", familyId: "f" });
      refreshTokenRepo.delete.mockRejectedValue(new Error("DB Connection Failed"));

      await expect(service.revoke(refreshToken)).resolves.not.toThrow();

      expect(refreshTokenRepo.delete).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe("revokeAll", () => {
    /**
     * Case 7: revokeAll(userId) ⭐⭐
     */
    it("should call the repo to revoke all tokens for a user", async () => {
      const userId = "user-1";

      await service.revokeAll(userId);

      expect(refreshTokenRepo.revokeAllByUser).toHaveBeenCalledWith(userId);
    });
  });
});
