// src/subgraphs/auth/services/oauth.service.ts
import { gql } from "graphql-tag";
import apolloClient from "../../../../shared/apollo/apolloClient.js";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
}

interface Profile {
  [key: string]: any;
}

interface OAuthInput {
  email: string;
  profile: Profile;
}

interface CreateUserInput {
  email: string;
  profile: Profile;
}

interface QueryResponse {
  data: {
    userByEmail: User | null;
  };
}

interface MutationResponse {
  data: {
    createOAuthUser: User;
  };
}

export async function oauthLogin(email: string, profile: Profile): Promise<User> {
  // 1. Query the User subgraph for existing user
  const { data }: QueryResponse = await apolloClient.query({
    query: gql`
      query userByEmail($email: String!) {
        userByEmail(email: $email) {
          id
          email
          role
          status
        }
      }
    `,
    variables: { email },
  });

  let user = data.userByEmail;

  // 2. If user doesn't exist, create one via mutation in User subgraph
  if (!user) {
    const { data: newData }: MutationResponse = await apolloClient.mutate({
      mutation: gql`
        mutation createOAuthUser($input: CreateOAuthUserInput!) {
          createOAuthUser(input: $input) {
            id
            email
            role
          }
        }
      `,
      variables: {
        input: { email, profile } as CreateUserInput,
      },
    });
    user = newData.createOAuthUser;
  }

  // 3. Return user to the auth flow (issue JWT, etc)
  return user;
}