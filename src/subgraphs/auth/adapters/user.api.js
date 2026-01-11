// src/subgraphs/auth/adapters/user.api.js
import { gql } from "@apollo/client/core";

export default class UserApi {
  constructor({ apolloClient }) {
    if (!apolloClient) throw new Error("UserApi: apolloClient is required");
    this.apolloClient = apolloClient;
  }

  async userByEmail(email) {
    const { data } = await this.apolloClient.query({
      query: gql`
        query UserByEmail($email: String!) {
          userByEmail(email: $email) {
            userId
            email
            role
          }
        }
      `,
      variables: { email },
    });
    return data.userByEmail;
  }

  async findOrCreateByOAuth(input) {
    const { data } = await this.apolloClient.mutate({
      mutation: gql`
        mutation FindOrCreateOAuth($input: OAuthUserInput!) {
          findOrCreateOAuthUser(input: $input) {
            userId
            email
            role
          }
        }
      `,
      variables: { input },
    });
    return data.findOrCreateOAuthUser;
  }

  async createUser(input) {
    const { data } = await this.apolloClient.mutate({
      mutation: gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            userId
            email
            role
          }
        }
      `,
      variables: { input },
    });
    return data.createUser;
  }
}
