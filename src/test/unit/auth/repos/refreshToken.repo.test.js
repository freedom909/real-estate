import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock jsonwebtoken to control the decoded payload
const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: mockJwt,
  ...mockJwt,
}));

const { default: jwt } = await import("jsonwebtoken");
const { default: RefreshTokenRepo } = await import(
  "../../../../subgraphs/auth/repos/refresh-token.repo.js"
);

describe("RefreshTokenRepo", () => {
  let repo;
  let MockModel;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a mock model with jest functions
    MockModel = {
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    };

    // Instantiate the repo with the mock model
    repo = new RefreshTokenRepo({ RefreshTokenModel: MockModel });
  });

  describe("constructor", () => {
    it("should throw if RefreshTokenModel is not provided", () => {
      expect(() => new RefreshTokenRepo({})).toThrow("RefreshTokenModel not injected");
    });
  });

  describe("consume", () => {
    it("should find and update a token by jti if it exists and is active", async () => {
      const token = "valid-token";
      const payload = { jti: "token-id-123" };
      jwt.decode.mockReturnValue(payload);
      MockModel.findOneAndUpdate.mockResolvedValue({ tokenId: "token-id-123", status: "used" });

      const result = await repo.consume(token);

      expect(jwt.decode).toHaveBeenCalledWith(token);
      expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { tokenId: payload.jti, status: "active" },
        {
          $set: {
            status: "used",
            rotatedAt: expect.any(Date),
          },
        },
        { new: true }
      );
      expect(result).toEqual({ tokenId: "token-id-123", status: "used" });
    });

    it("should return null if the token has no jti", async () => {
      const token = "token-without-jti";
      jwt.decode.mockReturnValue({ sub: "user-1" }); // No jti

      const result = await repo.consume(token);

      expect(result).toBeNull();
      expect(MockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("revokeBySession", () => {
    it("should call updateMany to revoke all tokens in a session", async () => {
      const sessionId = "session-123";
      await repo.revokeBySession(sessionId);

      expect(MockModel.updateMany).toHaveBeenCalledWith(
        { sessionId, revokedAt: null },
        { $set: { revokedAt: expect.any(Date) } }
      );
    });
  });

  describe("save", () => {
    it("should create a new token record from payload and meta", async () => {
      const token = "new-token";
      const payload = { jti: "new-token-id" };
      const meta = {
        userId: "user-1",
        familyId: "family-1",
        deviceId: "device-1",
        ip: "127.0.0.1",
        userAgent: "jest",
      };
      jwt.decode.mockReturnValue(payload);
      MockModel.create.mockResolvedValue({ tokenId: payload.jti, ...meta });

      await repo.save(token, meta);

      expect(jwt.decode).toHaveBeenCalledWith(token);
      expect(MockModel.create).toHaveBeenCalledWith({
        tokenId: payload.jti,
        userId: meta.userId,
        familyId: meta.familyId,
        deviceId: meta.deviceId,
        ip: meta.ip,
        userAgent: meta.userAgent,
        issuedAt: expect.any(Date),
      });
    });

    it("should throw an error if the token to be saved has no jti", async () => {
      const token = "token-without-jti";
      jwt.decode.mockReturnValue({ sub: "user-1" }); // No jti

      await expect(repo.save(token, {})).rejects.toThrow("refreshToken_JTI_MISSING");
      expect(MockModel.create).not.toHaveBeenCalled();
    });
  });

  describe("revokeFamily", () => {
    it("should call updateMany to revoke all active tokens in a family", async () => {
      const familyId = "family-123";
      await repo.revokeFamily(familyId);

      expect(MockModel.updateMany).toHaveBeenCalledWith(
        { familyId, status: "active" },
        {
          $set: {
            status: "revoked",
            revokedAt: expect.any(Date),
          },
        }
      );
    });
  });

  describe("revokeByDevice", () => {
    it("should call updateMany to revoke all active tokens for a specific device", async () => {
      const userId = "user-1";
      const deviceId = "device-1";
      await repo.revokeByDevice(userId, deviceId);

      expect(MockModel.updateMany).toHaveBeenCalledWith(
        { userId, deviceId, status: "active" },
        { $set: { status: "revoked", revokedAt: expect.any(Date) } }
      );
    });
  });

  describe("revokeAllByUser", () => {
    it("should call updateMany to revoke all active tokens for a user", async () => {
      const userId = "user-1";
      await repo.revokeAllByUser(userId);

      expect(MockModel.updateMany).toHaveBeenCalledWith(
        { userId, status: "active" },
        { $set: { status: "revoked", revokedAt: expect.any(Date) } }
      );
    });
  });
});