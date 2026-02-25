import { gql } from '@apollo/client';

// Query to send message to AI service
export const SEND_MESSAGE_TO_AI = gql`
  query SendMessageToAI($message: String!) {
    sendMessageToAI(message: $message) {
      reply
    }
  }
`;

// Query to get smart suggestions for users
export const GET_SMART_SUGGESTIONS = gql`
  query GetSmartSuggestions($userId: ID!) {
    getSmartSuggestions(userId: $userId) {
      suggestions
    }
  }
`;

// Query to get listing information
export const GET_LISTING_INFO = gql`
  query GetListingInfo($listingTitle: String!) {
    getListingInfo(listingTitle: $listingTitle) {
      id
      title
      description
      bookings {
        guestId
        startDate
        endDate
      }
      currentlyBookedDates
    }
  }
`;

// Mutation to apply title suggestions
export const APPLY_TITLE_SUGGESTION = gql`
  mutation ApplyTitleSuggestion($listingId: ID!) {
    applyTitleSuggestion(listingId: $listingId) {
      suggestion
    }
  }
`;

// Mutation to apply description suggestions
export const APPLY_DESCRIPTION_SUGGESTION = gql`
  mutation ApplyDescriptionSuggestion($listingId: ID!) {
    applyDescriptionSuggestion(listingId: $listingId) {
      suggestion
    }
  }
`;

// Mutation to reply to reviews
export const REPLY_TO_REVIEW = gql`
  mutation ReplyToReview($reviewId: ID!, $reviewText: String!) {
    replyToReview(reviewId: $reviewId, reviewText: $reviewText) {
      reply
    }
  }
`;