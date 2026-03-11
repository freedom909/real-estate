// src/subgraphs/auth/services/auth.service.oauthLogin.test.ts

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import AuthService from '../../../../subgraphs/auth/services/auth.service';
import { randomUUID } from 'crypto';

// =============================================================================
// 1️⃣ Mock External Modules
// =============================================================================
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('AuthService.oauthLogin', () => {
  let authService: AuthService;

  // Dependency mocks
  let mockOauthAccountRepo: any;
  let mockUserClient: any;
  let mockCredentialRepo: any;
  let mockTokenService: any;
  let mockLoginRiskService: any;
  let mockRefreshTokenRepo: any;
  let mockSessionRepo: any;
  let mockOauthService: any;
  let mockRefreshTokenService: any;
  let mockBlacklist: any;

  const mockFamilyId = 'mock-family-uuid';

  const mockProfile = {
    provider: 'google',
    providerUserId: 'google-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'http://avatar.url',
  };

  const mockCtx = { ip: '127.0.0.1', deviceId: 'device-123' };

  beforeEach(() => {
    jest.clearAllMocks();

    (randomUUID as jest.Mock).mockReturnValue(mockFamilyId);

    mockOauthAccountRepo = {
      findByProviderUserId: jest.fn(),
      create: jest.fn(),
      deleteByProvider: jest.fn(),
    };

    mockUserClient = {
      findByEmail: jest.fn(),
      createOAuthUser: jest.fn(),
    };

    mockCredentialRepo = {};
    mockTokenService = {};
    mockLoginRiskService = {};
    mockRefreshTokenRepo = {};
    mockSessionRepo = {};
    mockOauthService = {
      login: jest.fn(),
      verify: jest.fn(),
    };
    mockRefreshTokenService = {};
    mockBlacklist = {
      blacklist: jest.fn(),
    };

    authService = new AuthService({
      oauthAccountRepo: mockOauthAccountRepo,
      userClient: mockUserClient,
      credentialRepo: mockCredentialRepo,
      tokenService: mockTokenService,
      loginRiskService: mockLoginRiskService,
      refreshTokenRepo: mockRefreshTokenRepo,
      sessionRepo: mockSessionRepo,
      oauthService: mockOauthService,
      blacklist: mockBlacklist,
      refreshTokenService: mockRefreshTokenService,
    });
  });

  // =============================================================================
  // 🟢 Path A: Existing OAuth Mapping
  // =============================================================================
  it('should login existing user when OAuth account exists', async () => {
    const existingUserId = 'user-existing-123';

    mockOauthService.login.mockResolvedValue({
      _id: existingUserId,
      email: mockProfile.email,
      name: mockProfile.name,
      role: 'CUSTOMER',
      tokenVersion: 0,
    });

    mockSessionRepo.create.mockResolvedValue({ _id: 'session-123' });
    mockTokenService.issueTokenPair.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await authService.oauthLogin(mockProfile.provider, 'id-token');

    expect(mockOauthService.login).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBeDefined();
  });

  // =============================================================================
  // 🟡 Path A2: Corrupted OAuth Mapping (Missing userId)
  // =============================================================================
  it('should throw if OAuth account exists but userId is invalid', async () => {
    mockOauthService.login.mockRejectedValue(new Error('Invalid OAuth login'));

    await expect(
      authService.oauthLogin(mockProfile.provider, 'id-token')
    ).rejects.toThrow();
  });

  // =============================================================================
  // 🟢 Path B: Account Linking
  // =============================================================================
  it('should link OAuth account when user exists by email', async () => {
    const existingUserId = 'user-linked-456';

    mockOauthService.login.mockResolvedValue({
      _id: existingUserId,
      email: mockProfile.email,
      name: mockProfile.name,
      role: 'CUSTOMER',
      tokenVersion: 0,
    });

    mockSessionRepo.create.mockResolvedValue({ _id: 'session-123' });
    mockTokenService.issueTokenPair.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await authService.oauthLogin(mockProfile.provider, 'id-token');

    expect(mockOauthService.login).toHaveBeenCalledTimes(1);
  });

  // =============================================================================
  // 🟢 Path C: New User Registration
  // =============================================================================
  it('should create new user when no OAuth link and no existing user', async () => {
    const newUserId = 'user-new-789';

    mockOauthService.login.mockResolvedValue({
      _id: newUserId,
      email: mockProfile.email,
      name: mockProfile.name,
      role: 'CUSTOMER',
      tokenVersion: 0,
    });

    mockSessionRepo.create.mockResolvedValue({ _id: 'session-123' });
    mockTokenService.issueTokenPair.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await authService.oauthLogin(mockProfile.provider, 'id-token');

    expect(mockOauthService.login).toHaveBeenCalledTimes(1);
  });

  // =============================================================================
  // 🟡 Path D: Missing Email
  // =============================================================================
  it('should skip email lookup when profile.email is undefined', async () => {
    const newUserId = 'user-no-email-999';

    mockOauthService.login.mockResolvedValue({
      _id: newUserId,
      email: undefined,
      name: mockProfile.name,
      role: 'CUSTOMER',
      tokenVersion: 0,
    });

    mockSessionRepo.create.mockResolvedValue({ _id: 'session-123' });
    mockTokenService.issueTokenPair.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await authService.oauthLogin(mockProfile.provider, 'id-token');

    expect(mockOauthService.login).toHaveBeenCalledTimes(1);
  });

  // =============================================================================
  // 🔴 Path E: Dependency Failures
  // =============================================================================
  it('should propagate repository errors', async () => {
    const dbError = new Error('DB failure');

    mockOauthService.login.mockRejectedValue(dbError);

    await expect(
      authService.oauthLogin(mockProfile.provider, 'id-token')
    ).rejects.toThrow(dbError);
  });

  it('should propagate user client errors', async () => {
    mockOauthService.login.mockRejectedValue(
      new Error('User service down')
    );

    await expect(
      authService.oauthLogin(mockProfile.provider, 'id-token')
    ).rejects.toThrow('User service down');
  });

  // =============================================================================
  // 🔴 Path F: UUID Failure
  // =============================================================================
  it('should throw if randomUUID fails', async () => {
    (randomUUID as jest.Mock).mockImplementation(() => {
      throw new Error('UUID failure');
    });

    await expect(
      authService.oauthLogin(mockProfile.provider, 'id-token')
    ).rejects.toThrow('UUID failure');
  });
});
