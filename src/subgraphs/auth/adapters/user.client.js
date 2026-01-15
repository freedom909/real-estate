import { gql } from "graphql-request";

import {
  FIND_USER_BY_ID,
  FIND_USER_BY_EMAIL,
  CREATE_OAUTH_USER,
  
} from "./queries.js";

export default class UserClient {
  constructor(graphqlClient) {
    if (!graphqlClient) {
      throw new Error("UserClient: GraphQLClient is required");
    }
    this.client = graphqlClient;
  }

  /* =========================
     Queries
  ========================= */

  async findById(id) {
    if (!id) return null;

    const res = await this.client.request(
      FIND_USER_BY_ID,
      { id }
    );

    return res?.userById ?? null;
  }

  async findByEmail(email) {
    if (!email) return null;

    const res = await this.client.request(
      FIND_USER_BY_EMAIL,
      { email }
    );

    return res?.userByEmail ?? null;
  }

  /* =========================
     Mutations
  ========================= */

  async createOAuthUser(input) {
    if (!input?.email) {
      throw new Error("createOAuthUser: email is required");
    }

    const res = await this.client.request(
      CREATE_OAUTH_USER,
      { input }
    );

    return res?.createOAuthUser ?? null;
  }

async linkOAuthProvider({ userId, provider, providerUserId }) {
  const mutation = gql`
    mutation LinkOAuthProvider(
      $userId: ID!
      $provider: OAuthProvider!
      $providerUserId: String!
    ) {
      linkOAuthProvider(
        userId: $userId
        provider: $provider
        providerUserId: $providerUserId
      ) {
        id
        email
      }
    }
  `;

  const res = await this.client.request(mutation, {
    userId,
    provider,
    providerUserId,
  });

  return res.linkOAuthProvider;
}

}
