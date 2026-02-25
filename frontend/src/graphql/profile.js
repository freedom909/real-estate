import { gql } from '@apollo/client';

export const GET_PROFILE_BY_USERNAME = gql`
  query GetProfile($username: String!) {
    profile(username: $username) {
      id
      fullName
      username
      email
      bio
      location
      language
      timezone
      interests
      skills
      status
      isVerified
      networkCount
      stats { networkSize completedTransactions }
    }
  }
`;

export const GET_PROFILE_BY_TOKEN = gql`
  query GetProfileByToken($token: String!) {
    getProfileByToken(token: $token) {
      id
      fullName
      username
      email
      bio
      location
      language
      timezone
      interests
      skills
      status
      isVerified
      networkCount
      stats { networkSize completedTransactions }
    }
  }
`;