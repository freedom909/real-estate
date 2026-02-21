// 🔹 mocks (only external infra)
jest.mock('../../infrastructure/redis/redis.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../shared/debug', () => ({
  debugRisk: jest.fn(),
}));
import UserModel from '@/subgraphs/auth/models/user.model';

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// 🔹 IMPORTANT: use default imports for models
import RefreshTokenModel from '@/subgraphs/auth/models/refreshToken.model';
import SessionModel from '@/subgraphs/auth/models/session.model';

import AuthService from '@/subgraphs/auth/services/auth.service';
import RefreshTokenRepo from '@/subgraphs/auth/repos/refresh-token.repo';
import SessionRepo from '@/subgraphs/auth/repos/session.repo';
import TokenService from '@/subgraphs/auth/services/token/token.service';
import LoginRiskService from '@/subgraphs/auth/services/risk/loginRisk.service';
import RiskEventRepo from '@/subgraphs/auth/repos/riskEvent.repo';

describe('AuthService Integration - login', () => {
  let mongo: MongoMemoryServer;
  let authService: AuthService;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

beforeEach(async () => {
  // 1️⃣ Clean DB
  await mongoose.connection.dropDatabase();

  // 2️⃣ Recreate real repos
  const refreshTokenRepo = new RefreshTokenRepo({
    RefreshTokenModel,
  });

  const sessionRepo = new SessionRepo({
    SessionModel,
  });

  const tokenService = new TokenService();

  const riskEventRepo = {
    save: async () => undefined,
  };

  const loginRiskService = new LoginRiskService({
    riskEventRepo,
  });

  authService = new AuthService({
    loginRiskService,
    tokenService,
    refreshTokenRepo,
    sessionRepo,
    oauthService: {} as any,
    userClient: {} as any,
    credentialRepo: {} as any,
    oauthAccountRepo: {} as any,
  });
  
});

it('should persist session and refresh token in db', async () => {
  // 1️⃣ create real user
  const user = await UserModel.create({
  email: 'test@test.com',
  name: 'Test',
  emailVerified: true,
  provider: 'local',
  providerSub: 'uuid-test',
  tokenVersion: 0,
});


  // 2️⃣ use real _id
  const result = await authService._login(
    
    user._id.toString(),   // ✅ VALID ObjectId
    {
      familyId: 'family-id',
      ip: '127.0.0.1',
      deviceId: 'device-1',
      userAgent: 'jest',
    },
    false
  );

  const sessions = await mongoose.connection.db
    .collection('sessions')
    .find()
    .toArray();
console.log("sessions:", sessions);

  const tokens = await mongoose.connection.db
    .collection('refreshtokens')
    .find()
    .toArray();

  expect(result.accessToken).toBeDefined();
  expect(sessions.length).toBe(1);
  expect(tokens.length).toBe(1);
});

});
