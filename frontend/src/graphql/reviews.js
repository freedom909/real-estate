// GraphQL queries and mutations for reviews

export const GET_REVIEWS_FOR_LISTING = `
  query GetReviewsForListing($listingId: ID!) {
    reviewsForListing(listingId: $listingId) {
      id
      content
      rating
      author {
        id
        name
        picture
      }
      createdAt
      updatedAt
      isPinned
      isRecommended
      likes {
        id
        userId
        isPositive
      }
      dislikes {
        id
        userId
        isPositive
      }
    }
  }
`;

export const SUBMIT_GUEST_REVIEW = `
  mutation SubmitGuestReview($guestReview: ReviewInput!, $bookingId: ID!) {
    submitGuestReview(guestReview: $guestReview, bookingId: $bookingId) {
      code
      success
      message
      guestReview {
        id
        content
        rating
        author {
          id
          name
          picture
        }
        createdAt
      }
    }
  }
`;

export const SUBMIT_HOST_AND_LOCATION_REVIEWS = `
  mutation SubmitHostAndLocationReviews($bookingId: ID!, $hostReview: ReviewInput!, $locationReview: ReviewInput!) {
    submitHostAndLocationReviews(bookingId: $bookingId, hostReview: $hostReview, locationReview: $locationReview) {
      code
      success
      message
      hostReview {
        id
        content
        rating
        author {
          id
          name
          picture
        }
        createdAt
      }
      locationReview {
        id
        content
        rating
        author {
          id
          name
          picture
        }
        createdAt
      }
    }
  }
`;

export const SEARCH_REVIEWS = `
  query SearchReviews($input: SearchReviewsInput!) {
    searchReviews(input: $input) {
      id
      content
      rating
      author {
        id
        name
        picture
      }
      createdAt
      updatedAt
      isPinned
      isRecommended
    }
  }
`;