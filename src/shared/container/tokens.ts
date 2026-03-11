// src/shared/container/tokens.ts

import PolicyEngine from "@/security/policy.engine";
import AccesstokenBlacklist from "@/security/blacklist/blacklist";


export const TOKENS = {

  // =========================
  // Infrastructure Layer
  // =========================
  infra: {
    redis: Symbol("infra.redis"),
    cache: Symbol("infra.cache"),
    logger: Symbol("infra.logger"),
    config: Symbol("infra.config"),
  },

  // =========================
  // External Clients
  // =========================
  clients: {
    userSubgraphClient: Symbol("clients.userSubgraphClient"),
    githubApi: Symbol("clients.githubApi"),
    googleApi: Symbol("clients.googleApi"),
  },

  // =========================
  // Security Module
  // =========================
  security: {
    policyEngine: Symbol("security.policyEngine"),
    blacklist: Symbol("security.blacklist"),
    tokenBindingService: Symbol("security.tokenBindingService"),
  },

  // =========================
  // Auth Domain
  // =========================
  auth: {

    // adapters
    adapters: {
      oauthAdapter: Symbol("auth.adapters.oauthAdapter"),
      googleOAuthAdapter: Symbol("auth.adapters.googleOAuthAdapter"),
      githubOAuthAdapter: Symbol("auth.adapters.githubOAuthAdapter"),
    },

    // models
    models: {
      credential: Symbol("auth.models.credential"),
      refreshToken: Symbol("auth.models.refreshToken"),
      oauthAccount: Symbol("auth.models.oauthAccount"),
      session: Symbol("auth.models.session"),
      riskEvent: Symbol("auth.models.riskEvent"),
    },

    // repositories
    repos: {
      credentialRepo: Symbol("auth.repos.credentialRepo"),
      refreshTokenRepo: Symbol("auth.repos.refreshTokenRepo"),
      oauthAccountRepo: Symbol("auth.repos.oauthAccountRepo"),
      sessionRepo: Symbol("auth.repos.sessionRepo"),
      riskEventRepo: Symbol("auth.repos.riskEventRepo"),
    },

    // services
    services: {
      authService: Symbol("auth.services.authService"),
      tokenService: Symbol("auth.services.tokenService"),
      refreshTokenService: Symbol("auth.services.refreshTokenService"),
      oauthService: Symbol("auth.services.oauthService"),
      oauthVerifier: Symbol("auth.services.oauthVerifier"),
      loginRiskService: Symbol("auth.services.loginRiskService"),
      mergeAccountService: Symbol("auth.services.mergeAccountService"),
    },

    // providers
    providers: {
      keyProvider: Symbol("auth.providers.keyProvider"),
      envKeyProvider: Symbol("auth.providers.envKeyProvider"),
    },

    // guards
    guards: {
      authGuard: Symbol("auth.guards.authGuard"),
    }
  },

  // =========================
  // User Domain
  // =========================
  user: {

    userClient: Symbol("user.userClient"),

    models: {
      user: Symbol("user.models.user"),
      profile: Symbol("user.models.profile"),
    },

    repos: {
      userRepo: Symbol("user.repos.userRepo"),
      profileRepo: Symbol("user.repos.profileRepo"),
    },

    services: {
      userService: Symbol("user.services.userService"),
    }
  }

} as const


export type TOKENS_TYPE = typeof TOKENS