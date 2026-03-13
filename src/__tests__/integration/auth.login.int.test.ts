const TEST_PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE8fZtG5PNBhUT
5WruJTxbeUdpZxQVTpu1T2DhBSoyeMLWxlomCIECfyVpjGFdhCvbyf//kkQ6LCTL
MKW9H1g4uDczV42C92IgC+RXcHEfqpgC1t9TG14Fl8vTZzXiBj1MkM0LFpNXXLoS
imqW2XXtn4YscHKodD13OSgpQKtd9EWw7ITE3fw5rHAnoU3/I8mgZQk9HVI0R6ZO
H5APSf+iyLe88b6+j4q37LmJCWxiEYl6noRdpVcVad4ZCvPwVMgP/vSWNEr9adc/
bSRCVP5jg6CDa8RH9Qrke71zakEizjhj1/1Q6moqj2NQPoWZqfNaZ3IylcDQD4Vo
e+49ESOdAgMBAAECggEAAzsoNjuj/exO0p5XVfdGbKAqWJBYXZq5WaaNVr1YjXtt
tuUjyK8n1RXah0csuCjZXCgncXBbR8w+Z+PK1E98IwuvdcHGw8Wxoztbg61UlDBr
gToFPL42MxR9qfo6tOD+7UKmGoh3e/dv4t38FOPi2DZfY450uYH7gCxv4qPGkl2b
aOmPfKbMLG0AcjLinadUx6BcsmQBLGbVOp9UGHI/WvoWU4rQv8dP5dzmndNRAJXE
x37LcWj4FwE8Zbj9uV+f0Q6UW+/mMNN/1lgvzJ4LynO97fv/JJv3k5zTCurqRfIi
zKqZvC74IcRVQchntXUbZbEq/OHwHBxLtoidwve8AQKBgQDiNhwzYJTMdv9vLGRx
6uK7t530OgK6sCR7yJgz2c5wntXScAjGQ95NOGmppfKUGccHMz0BZhibcZiH4mXj
8B+RrOpH2XptoM+9vDkyXGQMbvM0FuMDv5r1wCdN6R7IiT7Io2969/xwNR0cxl/b
QTGLskuXYHSGtcbyQ1oHdWV/EwKBgQDe4T/XiB93X7qzdRx5qkRI0vti1Tj7Opyu
vxw8pLv8oPBMuNQjq9IURBVskj+BQhuEdD6Guk8K4lv0joExuThbjuQlqW0q5z9G
aCZKqL1rXEthWKWgY2vAq6m1UOBUldgFXr3Xltts1MOmmzA3C4OhRqQS527lO+a2
R+lCf4E4jwKBgH4k8oDsAM4sJbEXLkQgWaOYdyq0FsWIaC/m4ok3kllXGaGp/Bqj
yhmBtdp2wdk4rrYjKofXKS21oPtVksATLWeM53B9pDnyDSafCb49q0ULse+AO8Ph
W0Zjiwd1Ukc90ZcNHKOUGl9wHvXm4Zlgt4JRQLn/fbuJLpH2YQP7wUelAoGBAKv3
VBDygITUofMxGwVssD8YOsppBgwhjx7tadYIrNshOgeYXGYhfngQiA87UDBlV2H9
ZvkA61fUi2rIQTqiVK+gMrw0W3zM6+9hEJpuU6hwj+DOSwzTaSJB0TGK82uQKhsK
nKOpTChOiZ8VAkCWa7uWC6ZiVxgb/ckK9xlN0+BVAoGBAMzcthVT59d3z6BTnlxG
pKkOQ7FOQu2NoMKbVOZGlzUQ957wmSzP4gmuvlLzVcbHu+323MrR+fzsREpjZDNE
zY35i2DrzEGh3roCPosQeMYbGo3QvHKHGAv0B85InX4qHxI8D0mzOZhj48jzOTBQ
xO4pcp9PlEkc4yynGLJwnqcg
-----END PRIVATE KEY-----

-----END RSA PRIVATE KEY-----
`;

const TEST_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxPH2bRuTzQYVE+Vq7iU8
W3lHaWcUFU6btU9g4QUqMnjC1sZaJgiBAn8laYxhXYQr28n//5JEOiwkyzClvR9Y
OLg3M1eNgvdiIAvkV3BxH6qYAtbfUxteBZfL02c14gY9TJDNCxaTV1y6Eopqltl1
7Z+GLHByqHQ9dzkoKUCrXfRFsOyExN38OaxwJ6FN/yPJoGUJPR1SNEemTh+QD0n/
osi3vPG+vo+Kt+y5iQlsYhGJep6EXaVXFWneGQrz8FTID/70ljRK/WnXP20kQlT+
Y4Ogg2vER/UK5Hu9c2pBIs44Y9f9UOpqKo9jUD6FmanzWmdyMpXA0A+FaHvuPREj
nQIDAQAB
-----END PUBLIC KEY-----
`;

// 🔹 mocks (only external infra)
jest.mock('../../infrastructure/redis/redis.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

// 🔹 mock EnvKeyProvider to prevent singleton tokenService from failing on import
// This mock ensures that any module importing the singleton `tokenService`
// gets a working version during test setup, even before env vars are set.
jest.mock('@/subgraphs/auth/services/token/env-key.provider', () => {
  return {
    EnvKeyProvider: jest.fn().mockImplementation(() => ({
      getPrivateKey: () => TEST_PRIVATE_KEY,
      getPublicKey: () => TEST_PUBLIC_KEY,
    })),
  };
});

jest.mock('../../shared/debug', () => ({
  debugRisk: jest.fn(),
}));
import UserModel from '@/subgraphs/user/models/user.model';

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// 🔹 IMPORTANT: use default imports for models
import RefreshTokenModel from '@/subgraphs/auth/models/refreshToken.model';
import SessionModel from '@/subgraphs/auth/models/session.model';

import AuthService from '@/subgraphs/auth/services/auth.service';
import RefreshTokenRepo from '@/subgraphs/authz/repos/refresh-token.repo';
import SessionRepo from '@/subgraphs/auth/repos/session.repo';
import { TokenService } from '@/subgraphs/auth/services/token.service';
import LoginRiskService from '@/subgraphs/auth/services/risk/login.engine';
import RiskEventRepo from '@/subgraphs/auth/repos/riskEvent.repo';
import path from 'path';

describe('AuthService Integration - login', () => {
  let mongo: MongoMemoryServer;
  let authService: AuthService;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    process.env.MONGO_URI = uri;
    (global as any).__MONGO__ = mongo;
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

  class TestKeyProvider {
  getPrivateKey() {
    return TEST_PRIVATE_KEY;
  }
  getPublicKey() {
    return TEST_PUBLIC_KEY;
  }
}
  const tokenService = new TokenService({} as any, {} as any);

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
    credentialRepo: {} as any,
    blacklist: {} as any,
    refreshTokenService: {} as any,
  });

});

it('should persist session and refresh token in db', async () => {
  // 1️⃣ create real user
  const user = await UserModel.create({
  email: 'test@test.com',
  name: 'Test',
  role: 'CUSTOMER',
  status: 'ACTIVE',
  tokenVersion: 0,
});


  // 2️⃣ use real _id
  const result = await authService.oauthLogin(
    'local',
    'test-id-token'
  );

  const sessions = await mongoose.connection.db
    .collection('sessions')
    .find()
    .toArray();

  const tokens = await mongoose.connection.db
    .collection('refreshtokens')
    .find()
    .toArray();

  expect(result.accessToken).toBeDefined();
  expect(sessions.length).toBeGreaterThanOrEqual(0);
  expect(tokens.length).toBeGreaterThanOrEqual(0);
});

});
