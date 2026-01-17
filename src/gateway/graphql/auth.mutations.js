// gateway/graphql/auth.mutations.js
import { gql } from "graphql-tag";

export const OAUTH_LOGIN = gql`
  mutation OAuthLogin($provider: OAuthProvider!, $idToken: String!) {
    oauthLogin(provider: $provider, idToken: $idToken) {
      accessToken
      refreshToken
      user {
        id
      }
    }
  }
`;
