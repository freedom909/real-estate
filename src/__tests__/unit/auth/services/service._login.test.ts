// src/subgraphs/auth/services/auth.service._login.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import AuthService from '../../../../subgraphs/auth/services/auth.service';
import LoginRiskService from '../../../../subgraphs/auth/services/risk/loginRisk.service';
import TokenService from '../../../../subgraphs/auth/services/token/token.service';
import RefreshTokenRepo from '../../../../subgraphs/auth/repos/refresh-token.repo';
import SessionRepo from '../../../../subgraphs/auth/repos/session.repo';
import { Types } from 'mongoose';

describe('AuthService._login', () => {
    let authService: AuthService;

    let mockTokenService: {
        issueTokens: jest.Mock;
    };

    let mockLoginRiskService: {
        record: jest.MockedFunction<LoginRiskService["record"]>;
    };

    beforeEach(() => {
        mockLoginRiskService = {
            record: jest.fn<LoginRiskService["record"]>()
        };

        mockLoginRiskService.record.mockResolvedValue(undefined);
    });


    mockTokenService = {
        issueTokens: jest.fn().mockReturnValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            refreshJti: 'refresh-jti',
        }),
    };

    let mockRefreshTokenRepo: {
        save: jest.MockedFunction<RefreshTokenRepo["save"]>;
    };

    let mockSessionRepo: {
        create: jest.MockedFunction<SessionRepo["create"]>;
    };

    beforeEach(() => {
        mockRefreshTokenRepo = {
            save: jest.fn<RefreshTokenRepo["save"]>(),
        };

        mockSessionRepo = {
            create: jest.fn<SessionRepo["create"]>(),
        };

        mockRefreshTokenRepo.save.mockResolvedValue(undefined);
        const mockObjectId = new Types.ObjectId();

        mockSessionRepo.create.mockResolvedValue({
            _id: mockObjectId,
        } as any);
    

    authService = new AuthService({
        loginRiskService: mockLoginRiskService as any,
        tokenService: mockTokenService as any,
        refreshTokenRepo: mockRefreshTokenRepo as any,
        sessionRepo: mockSessionRepo as any,
        oauthService: {} as any,
        userClient: {} as any,
        credentialRepo: {} as any,
        oauthAccountRepo: {} as any,
    });
  });

  it('should login successfully', async () => {
    const result = await authService._login(
      'user-id',
      {
        familyId: 'family-id',
        ip: '127.0.0.1',
        deviceId: 'device-1',
        userAgent: 'jest',
      },
      false
    );

    expect(result.accessToken).toBe('access-token');
    expect(mockLoginRiskService.record).toHaveBeenCalled();
    expect(mockRefreshTokenRepo.save).toHaveBeenCalled();
  });
});

