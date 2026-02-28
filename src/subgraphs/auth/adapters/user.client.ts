import { gql, GraphQLClient } from "graphql-request";

import {
  FIND_USER_BY_ID,
  FIND_USER_BY_EMAIL,
  CREATE_OAUTH_USER,

} from "./queries.js";

interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    name: string;
    avatar: string;
  };
}

interface OAuthProvider {
  // 必要に応じて定義を追加
}

interface CreateOAuthUserInput {
  email: string;
  profile?: any;
  familyId?: string;
  [key: string]: any;
}

export default class UserClient {
  private client: GraphQLClient;

  constructor(graphqlClient: GraphQLClient) {
    if (!graphqlClient) {
      throw new Error("UserClient: GraphQLClient is required");
    }
    this.client = graphqlClient;
  }

  /* =========================
     Queries
  ========================= */

  async findById(id: string): Promise<User | null> {
    if (!id) return null;

    const res: any = await this.client.request(
      FIND_USER_BY_ID,
      { id }
    );

    return res?.userById ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;

    const res: any = await this.client.request(
      FIND_USER_BY_EMAIL,
      { email }
    );

    return res?.userByEmail ?? null;
  }

  /* =========================
     Mutations
  ========================= */

  async createOAuthUser(input: CreateOAuthUserInput): Promise<User | null> {
    if (!input?.email) {
      throw new Error("createOAuthUser: email is required");
    }

    const res: any = await this.client.request(
      CREATE_OAUTH_USER,
      { input }
    );

    return res?.createOAuthUser ?? null;
  }

  async linkOAuthProvider({ 
    userId, 
    provider, 
    providerUserId 
  }: { 
    userId: string; 
    provider: string; 
    providerUserId: string; 
  }): Promise<User | null> {
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

    const res: any = await this.client.request(mutation, {
      userId,
      provider,
      providerUserId,
    });

    return res.linkOAuthProvider;
  }
}