// src/subgraphs/auth/services/auth.service._login.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';



interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
}

interface TokenService {
  issueTokens(userId: string): Promise<TokensResponse>;
}

class AuthService {
  constructor(private tokenService: TokenService) {}

  async login(userId: string) {
    return this.tokenService.issueTokens(userId);
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    // ✅ 类型安全 mock
    mockTokenService = {
      issueTokens: jest.fn(),
    } as jest.Mocked<TokenService>;

    authService = new AuthService(mockTokenService);
  });

  describe('login', () => {
    it('should issue tokens successfully', async () => {
      // Arrange
      mockTokenService.issueTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        refreshJti: 'refresh-jti',
      });

      // Act
      const result = await authService.login('user-id');

      // Assert
      expect(mockTokenService.issueTokens).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        refreshJti: 'refresh-jti',
      });
    });

    it('should throw if token service fails', async () => {
      // Arrange
      mockTokenService.issueTokens.mockRejectedValue(
        new Error('Token error')
      );

      // Act + Assert
      await expect(authService.login('user-id'))
        .rejects
        .toThrow('Token error');

      expect(mockTokenService.issueTokens)
        .toHaveBeenCalledTimes(1);
    });
  });
});



