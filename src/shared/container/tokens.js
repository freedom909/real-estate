import UserModel from "../../subgraphs/user/models/user.model.js";

export const TOKENS = {
  infra: {
    redis: Symbol("infra.redis"),
    githubApi: Symbol("infra.githubApi"),
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

    // repos
    credentialRepo: Symbol("auth.credentialRepo"),
    refreshTokenRepo: Symbol("auth.refreshTokenRepo"),
    riskEventRepo: Symbol("auth.riskEventRepo"),
    userSubgraphClient: Symbol("auth.userSubgraphClient"),
    oauthAccountRepo: Symbol("auth.oauthAccountRepo"),
    
    // services
    tokenService: Symbol("auth.tokenService"),
    refreshTokenService: Symbol("auth.refreshTokenService"),
    
    oauthVerifier: Symbol("auth.oauthVerifier"),
    loginRiskService: Symbol("auth.loginRiskService"),
    authService: Symbol("auth.authService"),
  },

    user: {
    userService: Symbol("user.userService"),
    userRepo: Symbol("user.userRepo"),
    profileRepo: Symbol("user.profileRepo"),
    userModel: Symbol("user.userModel"),
    profileModel: Symbol("user.profileModel"),
  },
};
