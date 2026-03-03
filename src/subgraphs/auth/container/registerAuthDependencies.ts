// src/subgraphs/auth/container/registerAuthDependencies.ts

import { container } from "tsyringe";
import { TOKENS } from "../../../shared/container/tokens.js";

import Blacklist from "../../../shared/security/blacklist.js";
import { createUserGraphQLClient } from "../adapters/user.client.factory.js";

import CredentialModel from "../models/credential.model.js";
import RefreshTokenModel from "../models/refreshToken.model.js";
import OAuthAccountModel from "../models/oauthAccounts.model.js";
import UserModel from "../../user/models/user.model.js";
import SessionModel from "../models/session.model.js";

import CredentialRepo from "../repos/credential.repo.js";
import RefreshTokenRepo from "../repos/refresh-token.repo.js";
import RiskEventRepo from "../repos/riskEvent.repo.js";
import OAuthAccountRepo from "../repos/oauthAccount.repo.js";
import UserRepo from "../repos/user.repo.js";
import SessionRepo from "../repos/session.repo.js";

import LoginRiskService from "../services/risk/loginRisk.service.js";
import TokenService, { KeyProvider } from "../services/token/token.service.js";
import { EnvKeyProvider } from "../services/token/env-key.provider.js";
import OAuthVerifier from "../services/oauth/oauthVerifier.js";
import OAuthService from "../services/oauth/oauth.service.js";
import AuthService from "../services/auth.service.js";

import UserClient from "../adapters/user.client.js";
import OAuthAdapter from "../adapters/oauth/index.js";
import GoogleOAuthAdapter from "../adapters/oauth/google.adapter.js";
import GithubOAuthAdapter from "../adapters/oauth/github.adapter.js";
import { GithubApi } from "../adapters/oauth/githubApi.js";

import redis from "@/infrastructure/redis/redis.js";
import { AuthGuard } from "../guards/auth.guard.js";
import TokenBindingService from "../middleware/tokenBindingService.js";

export function registerAuthDependencies() {

  // =============================
  // Guards / Middleware
  // =============================
  container.register(TOKENS.auth.authGuard, { useClass: AuthGuard });
  container.register(TOKENS.auth.tokenBindingService, { useClass: TokenBindingService });

  // =============================
  // Infra
  // =============================
  container.register(TOKENS.auth.keyProvider, {
    useClass: EnvKeyProvider,
  });

  container.register(TOKENS.security.blacklist, {
    useFactory: () => new Blacklist(redis),
  });

  container.register(TOKENS.infra.redis, {
    useValue: redis,
  });

  // =============================
  // Models
  // =============================
  container.register(TOKENS.auth.credentialModel, { useValue: CredentialModel });
  container.register(TOKENS.auth.refreshTokenModel, { useValue: RefreshTokenModel });

  // =============================
  // Repositories
  // =============================
  container.register(TOKENS.auth.credentialRepo, {
    useFactory: (c) =>
      new CredentialRepo({
        CredentialModel: c.resolve(TOKENS.auth.credentialModel),
      }),
  });

  container.register(TOKENS.auth.refreshTokenRepo, {
    useFactory: (c) =>
      new RefreshTokenRepo({
        RefreshTokenModel: c.resolve(TOKENS.auth.refreshTokenModel),
      }),
  });

  container.register(TOKENS.auth.riskEventRepo, {
    useClass: RiskEventRepo,
  });

  container.register(TOKENS.auth.userRepo, {
    useFactory: () => new UserRepo({ UserModel }),
  });

  container.register(TOKENS.auth.sessionRepo, {
    useFactory: () => new SessionRepo({ SessionModel }),
  });

  container.register(TOKENS.auth.oauthAccountRepo, {
    useFactory: () => new OAuthAccountRepo({ model: OAuthAccountModel }),
  });

  // =============================
  // GraphQL Client
  // =============================
  container.register(TOKENS.auth.userGraphQLClient, {
    useFactory: () => createUserGraphQLClient(),
  });

  container.register(TOKENS.auth.userClient, {
    useFactory: (c) =>
      new UserClient(c.resolve(TOKENS.auth.userGraphQLClient)),
  });

  // =============================
  // OAuth
  // =============================
  container.register(TOKENS.auth.googleOAuthAdapter, {
    useFactory: () =>
      new GoogleOAuthAdapter({
        clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      }),
  });

  container.register(TOKENS.infra.githubApi, {
    useFactory: () =>
      new GithubApi({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
  });

  container.register(TOKENS.auth.githubOAuthAdapter, {
    useFactory: (c) =>
      new GithubOAuthAdapter({
        githubApi: c.resolve(TOKENS.infra.githubApi),
      }),
  });

  container.register(TOKENS.auth.oauthAdapter, {
    useFactory: (c) =>
      new OAuthAdapter({
        google: c.resolve(TOKENS.auth.googleOAuthAdapter),
        github: c.resolve(TOKENS.auth.githubOAuthAdapter),
      }),
  });

  container.register(TOKENS.auth.oauthVerifier, {
    useClass: OAuthVerifier,
  });

  container.register(TOKENS.auth.oauthService, {
    useFactory: (c) =>
      new OAuthService({
        oauthAdapter: c.resolve(TOKENS.auth.oauthAdapter),
        oauthVerifier: c.resolve(TOKENS.auth.oauthVerifier),
        oauthAccountRepo: c.resolve(TOKENS.auth.oauthAccountRepo),
        userRepo: c.resolve(TOKENS.auth.userRepo),
      }),
  });

  // =============================
  // Token
  // =============================
  container.register(TOKENS.auth.tokenService, {
    useFactory: (c) => {
      const keyProvider = c.resolve<KeyProvider>(TOKENS.auth.keyProvider);

      return new TokenService(keyProvider, {
        issuer: process.env.JWT_ISSUER!,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
      });
    },
  });

  container.register(TOKENS.auth.loginRiskService, {
    useFactory: (c) =>
      new LoginRiskService({
        riskEventRepo: c.resolve(TOKENS.auth.riskEventRepo),
      }),
  });

  // =============================
  // AuthService
  // =============================
  container.register<AuthService>(TOKENS.auth.authService, {
    useFactory: (c) =>
      new AuthService({
        oauthService: c.resolve(TOKENS.auth.oauthService),
        userClient: c.resolve(TOKENS.auth.userClient),
        credentialRepo: c.resolve(TOKENS.auth.credentialRepo),
        tokenService: c.resolve(TOKENS.auth.tokenService),
        loginRiskService: c.resolve(TOKENS.auth.loginRiskService),
        refreshTokenRepo: c.resolve(TOKENS.auth.refreshTokenRepo),
        oauthAccountRepo: c.resolve(TOKENS.auth.oauthAccountRepo),
        sessionRepo: c.resolve(TOKENS.auth.sessionRepo),
        blacklist: c.resolve(TOKENS.security.blacklist),
      }),
  });
}