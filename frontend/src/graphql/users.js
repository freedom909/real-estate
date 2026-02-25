import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      fullName
      firstName
      lastName
      role
      status
      picture
      nickname
      provider
      oauthId
    }
  }
`;

export const GET_USER_DASHBOARD = gql`
  query GetUserDashboard($userId: ID!) {
    userDashboard(userId: $userId) {
      user {
        id
        name
        email
        role
        status
        avatar
        joinedAt
      }
      totalListings
      totalBookings
      recentBookings {
        id
        listingTitle
        checkIn
        checkOut
        totalPrice
        createdAt
      }
      recentListings {
        id
        title
        price
        imageUrl
        createdAt
      }
    }
  }
`;

export const LIST_USERS = gql`
  query ListUsers {
    users {
      id
      email
      role
      status
      nickname
    }
  }
`;