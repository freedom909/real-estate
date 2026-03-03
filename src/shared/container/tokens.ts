import PolicyEngine from "@/security/policy.engine";
import AccesstokenBlacklist from "@/shared/security/blacklist";


export const TOKENS = {
  infra: {
    githubApi: Symbol("infra.githubApi"),
    redis: Symbol("infra.redis"),
    cache: Symbol("infra.cache"),
    
  },

  auth: {
    // adapters
    userApi: Symbol("auth.userApi"),
    userClient: Symbol("auth.userClient"),
    userService: Symbol("auth.userService"),
    oauthAdapter:Symbol("auth.oauthAdapter"),
    
    userGraphQLClient: Symbol("auth.userGraphQLClient"),
    userSubgraphClient: Symbol("auth.userSubgraphClient"),
    googleOAuthAdapter: Symbol("auth.googleOAuthAdapter"),
    githubOAuthAdapter: Symbol("auth.githubOAuthAdapter"),


    // models
    credentialModel: Symbol("auth.credentialModel"),
    refreshTokenModel: Symbol("auth.refreshTokenModel"),
    oauthAccountModel: Symbol('oauthAccountModel'),
    sessionModel: Symbol('sessionModel'),

    // repos
    credentialRepo: Symbol("auth.credentialRepo"),
    refreshTokenRepo: Symbol("auth.refreshTokenRepo"),
    riskEventRepo: Symbol("auth.riskEventRepo"),
    keyProvider: Symbol("auth.keyProvider"),
    oauthAccountRepo: Symbol("auth.oauthAccountRepo"),
    userRepo: Symbol("auth.userRepo"),
    sessionRepo: Symbol("auth.sessionRepo"),

    // services
    envKeyProvider: Symbol("auth.envKeyProvider"),
    tokenService: Symbol("auth.tokenService"),
    refreshTokenService: Symbol("auth.refreshTokenService"),
    loginRiskService: Symbol("auth.loginRiskService"),
    authService: Symbol("auth.authService"),
    mergeAccountService: Symbol("mergeAccountService"),
    oauthService: Symbol("auth.oauthService"),
    oauthVerifier: Symbol("auth.oauthVerifier"),
    // guards
    authGuard: Symbol("auth.authGuard"),
    tokenBindingService: Symbol("auth.tokenBindingService"),
  },

  user: {
    userService: Symbol("user.userService"),
    userRepo: Symbol("user.userRepo"),
    profileRepo: Symbol("user.profileRepo"),
    userModel: Symbol("user.userModel"),
    profileModel: Symbol("user.profileModel"),
  },
  security:{
  policyEngine: Symbol("security.policyEngine"),
  blacklist: Symbol("security.blacklist"),
}
} as const;


export type TOKENS_TYPE = typeof TOKENS;