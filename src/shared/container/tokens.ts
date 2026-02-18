import PolicyEngine from "@/security/policy.engine";


export const TOKENS = {
  infra: {
    redis: Symbol("infra.redis"),
    githubApi: Symbol("infra.githubApi"),
    cache: Symbol("infra.cache"),
  },

  auth: {
    // adapters
    userApi: Symbol("auth.userApi"),
    userClient: Symbol("auth.userClient"),
    userService: Symbol("auth.userService"),
    userGraphQLClient: Symbol("auth.userGraphQLClient"),
    userSubgraphClient: Symbol("auth.userSubgraphClient"),
    oauthAdapter: Symbol("auth.oauthAdapter"),
    oauthVerifier: Symbol("auth.oauthVerifier"),
    googleOAuthAdapter: Symbol("auth.googleOAuthAdapter"),

    // models
    credentialModel: Symbol("auth.credentialModel"),
    refreshTokenModel: Symbol("auth.refreshTokenModel"),
    oauthAccountModel: Symbol('oauthAccountModel'),

    // repos
    credentialRepo: Symbol("auth.credentialRepo"),
    refreshTokenRepo: Symbol("auth.refreshTokenRepo"),
    riskEventRepo: Symbol("auth.riskEventRepo"),
    
    oauthAccountRepo: Symbol("auth.oauthAccountRepo"),
    userRepo: Symbol("auth.userRepo"),
    sessionRepo: Symbol("auth.sessionRepo"),

    // services
    tokenService: Symbol("auth.tokenService"),
    refreshTokenService: Symbol("auth.refreshTokenService"),
    loginRiskService: Symbol("auth.loginRiskService"),
    authService: Symbol("auth.authService"),
    mergeAccountService: Symbol("mergeAccountService"),
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
}
} as const;


export type TOKENS_TYPE = typeof TOKENS;