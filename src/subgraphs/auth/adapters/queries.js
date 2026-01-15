import { gql } from "graphql-request";

/* =========================
   Queries
========================= */

export const FIND_USER_BY_ID = gql`
  query FindUserById($id: ID!) {
    user(id: $id) {
      id
      email
      role
      status
      profile {
        name
        avatar
      }
    }
  }
`;

export const FIND_USER_BY_EMAIL = gql`
  query FindUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      email
      role
      status
      profile {
        name
        avatar
      }
    }
  }
`;

/* =========================
   Mutations
========================= */

export const CREATE_OAUTH_USER = gql`
  mutation CreateOAuthUser($input: CreateOAuthUserInput!) {
    createOAuthUser(input: $input) {
      id
      email
      role
      status
      profile {
        name
        avatar
      }
    }
  }
`;
