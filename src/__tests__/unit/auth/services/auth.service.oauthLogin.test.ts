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
    mockOauthService = {};

    authService = new AuthService({
      oauthAccountRepo: mockOauthAccountRepo,
      userClient: mockUserClient,
      credentialRepo: mockCredentialRepo,
      tokenService: mockTokenService,
      loginRiskService: mockLoginRiskService,
      refreshTokenRepo: mockRefreshTokenRepo,
      sessionRepo: mockSessionRepo,
      oauthService: mockOauthService,
    });

    jest
      .spyOn(authService as any, '_login')
      .mockResolvedValue({ success: true, userId: 'final-user-id' });
  });

  // =============================================================================
  // 🟢 Path A: Existing OAuth Mapping
  // =============================================================================
  it('should login existing user when OAuth account exists', async () => {
    const existingUserId = 'user-existing-123';

    mockOauthAccountRepo.findByProviderUserId.mockResolvedValue({
      userId: existingUserId,
    });

    const result = await authService.oauthLogin(mockProfile, mockCtx);

    expect(mockOauthAccountRepo.findByProviderUserId).toHaveBeenCalledTimes(1);
    expect(mockUserClient.findByEmail).not.toHaveBeenCalled();
    expect(mockOauthAccountRepo.create).not.toHaveBeenCalled();
    expect(mockUserClient.createOAuthUser).not.toHaveBeenCalled();

    expect((authService as any)._login).toHaveBeenCalledTimes(1);
    expect((authService as any)._login).toHaveBeenCalledWith(
      existingUserId,
      { ...mockCtx, familyId: mockFamilyId },
      false
    );

    expect(result).toEqual({ success: true, userId: 'final-user-id' });
  });

  // =============================================================================
  // 🟡 Path A2: Corrupted OAuth Mapping (Missing userId)
  // =============================================================================
  it('should throw if OAuth account exists but userId is invalid', async () => {
    mockOauthAccountRepo.findByProviderUserId.mockResolvedValue({
      userId: undefined,
    });

    await expect(
      authService.oauthLogin(mockProfile, mockCtx)
    ).rejects.toThrow();

    expect((authService as any)._login).not.toHaveBeenCalled();
  });

  // =============================================================================
  // 🟢 Path B: Account Linking
  // =============================================================================
  it('should link OAuth account when user exists by email', async () => {
    const existingUserId = 'user-linked-456';

    mockOauthAccountRepo.findByProviderUserId.mockResolvedValue(null);
    mockUserClient.findByEmail.mockResolvedValue({ id: existingUserId });

    await authService.oauthLogin(mockProfile, mockCtx);

    expect(mockUserClient.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockOauthAccountRepo.create).toHaveBeenCalledTimes(1);

    expect(mockOauthAccountRepo.create).toHaveBeenCalledWith({
      userId: existingUserId,
      provider: mockProfile.provider,
      providerUserId: mockProfile.providerUserId,
      email: mockProfile.email,
      familyId: mockFamilyId,
    });

    expect((authService as any)._login).toHaveBeenCalledWith(
      existingUserId,
      expect.objectContaining({ familyId: mockFamilyId }),
      false
    );
  });

  // =============================================================================
  // 🟢 Path C: New User Registration
  // =============================================================================
  it('should create new user when no OAuth link and no existing user', async () => {
    const newUserId = 'user-new-789';

    mockOauthAccountRepo.findByProviderUserId.mockResolvedValue(null);
    mockUserClient.findByEmail.mockResolvedValue(null);
    mockUserClient.createOAuthUser.mockResolvedValue({ id: newUserId });

    await authService.oauthLogin(mockProfile, mockCtx);

    expect(mockUserClient.createOAuthUser).toHaveBeenCalledTimes(1);

    expect((authService as any)._login).toHaveBeenCalledWith(
      newUserId,
      expect.objectContaining({ familyId: mockFamilyId }),
      true
    );
  });

  // =============================================================================
  // 🟡 Path D: Missing Email
  // =============================================================================
  it('should skip email lookup when profile.email is undefined', async () => {
    const profileNoEmail = { ...mockProfile, email: undefined };
    const newUserId = 'user-no-email-999';

    mockOauthAccountRepo.findByProviderUserId.mockResolvedValue(null);
    mockUserClient.createOAuthUser.mockResolvedValue({ id: newUserId });

    await authService.oauthLogin(profileNoEmail, mockCtx);

    expect(mockUserClient.findByEmail).not.toHaveBeenCalled();
    expect(mockUserClient.createOAuthUser).toHaveBeenCalledTimes(1);

    expect((authService as any)._login).toHaveBeenCalledWith(
      newUserId,
      expect.anything(),
      true
    );
  });

  // =============================================================================
  // 🔴 Path E: Dependency Failures
  // =============================================================================
  it('should propagate repository errors', async () => {
    const dbError = new Error('DB failure');

    mockOauthAccountRepo.findByProviderUserId.mockRejectedValue(dbError);

    await expect(
      authService.oauthLogin(mockProfile, mockCtx)
    ).rejects.toThrow(dbError);
  });

  it('should propagate user client errors', async () => {
    mockOauthAccountRepo.findByProviderUserId.mockResolvedValue(null);
    mockUserClient.findByEmail.mockRejectedValue(
      new Error('User service down')
    );

    await expect(
      authService.oauthLogin(mockProfile, mockCtx)
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
      authService.oauthLogin(mockProfile, mockCtx)
    ).rejects.toThrow('UUID failure');
  });
});
