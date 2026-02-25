import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

const jwt = await import("jsonwebtoken");
const { default: TokenService } = await import(
  "../../../../../src/subgraphs/auth/services/token/token.service.js"
);

describe("TokenService", () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.ACCESS_TOKEN_SECRET = "access-secret";
    process.env.refreshToken_SECRET = "refresh-secret";

    service = new TokenService();
  });

  it("signAccessToken()", () => {
    jwt.sign.mockReturnValue("access.jwt");

    const token = service.signAccessToken({
      sub: "user-1",
      sessionId: "sess-1",
      scope: ["user"],
    });

    expect(jwt.sign).toHaveBeenCalled();
    expect(token).toBe("access.jwt");
  });
});
