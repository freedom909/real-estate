import { gql } from '@apollo/client';

export const GET_LISTINGS = gql`
  query GetListings($filters: ListingFilters, $pagination: PaginationInput) {
    listings(filters: $filters, pagination: $pagination) {
      id
      title
      description
      price
      location
      city
      country
      imageUrl
      rating
      reviewCount
      host {
        id
        name
        avatar
        rating
      }
      amenities
      maxGuests
      bedrooms
      bathrooms
      status
      createdAt
      updatedAt
      isAvailable
      checkInTime
      checkOutTime
    }
  }
`;

export const GET_LISTING_DETAILS = gql`
  query GetListingDetails($id: ID!) {
    listing(id: $id) {
      id
      title
      description
      price
      location
      city
      country
      imageUrl
      rating
      reviewCount
      host {
        id
        name
        avatar
        rating
        joinedAt
        responseRate
        responseTime
      }
      amenities
      maxGuests
      bedrooms
      bathrooms
      status
      createdAt
      updatedAt
      isAvailable
      checkInTime
      checkOutTime
      houseRules
      cancellationPolicy
      availability {
        date
        available
      }
      reviews {
        id
        rating
        comment
        createdAt
        guest {
          name
          avatar
        }
      }
    }
  }
`;

export const GET_USER_LISTINGS = gql`
  query GetUserListings($userId: ID!) {
    userListings(userId: $userId) {
      id
      title
      description
      price
      location
      city
      country
      imageUrl
      rating
      reviewCount
      status
      createdAt
      updatedAt
      bookingsCount
      isAvailable
      amenities
      maxGuests
      bedrooms
      bathrooms
    }
  }
`;

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      code
      success
      message
      listing {
        id
        title
        description
        price
        hostId
        locationId
        listingStatus
        locationType
        pictures
        numOfBeds
        isFeatured
        saleAmount
        checkInDate
        checkOutDate
      }
    }
  }
`;

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
    updateListing(id: $id, input: $input) {
      id
      title
      description
      price
      location
      status
      updatedAt
    }
  }
`;

export const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id) {
      id
      success
    }
  }
`;

export const GET_LISTING_ANALYTICS = gql`
  query GetListingAnalytics($listingId: ID!) {
    listingAnalytics(listingId: $listingId) {
      views
      bookings
      revenue
      rating
      reviewCount
      availabilityRate
      monthlyStats {
        month
        bookings
        revenue
        views
      }
    }
  }
`;

export const SEARCH_LISTINGS = gql`
  query SearchListings($query: String!, $filters: SearchFilters) {
    searchListings(query: $query, filters: $filters) {
      id
      title
      description
      price
      location
      city
      country
      imageUrl
      rating
      reviewCount
      amenities
      maxGuests
      bedrooms
      bathrooms
    }
  }
`;

export const GET_FEATURED_LISTINGS = gql`
  query GetFeaturedListings {
    featuredListings {
      id
      title
      description
      price
      location
      city
      country
      imageUrl
      rating
      reviewCount
      isFeatured
      featuredUntil
    }
  }
`;

export const GET_LISTING_STATS = gql`
  query GetListingStats {
    listingStats {
      totalListings
      activeListings
      pendingListings
      totalBookings
      totalRevenue
      averageRating
      popularCities {
        city
        count
      }
    }
  }
`;