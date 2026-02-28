import { gql } from "graphql-request";

/* =========================
   Queries
========================= */

export const FIND_USER_BY_ID = gql`
  query FindUserById($id: ID!) {
    user(id: $id) {
      id      
      role
      profile {
        name
        avatar
        email
      }
    }
  }
`;

export const FIND_USER_BY_EMAIL = gql`
  query FindUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      role
      profile {
        name
        avatar
        email
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
      role
      profile {
        name
        avatar
        email
      }
    }
  }
`;