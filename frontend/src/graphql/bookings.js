import { gql } from '@apollo/client';

export const GET_USER_BOOKINGS = gql`
  query GetUserBookings($userId: ID!) {
    userBookings(userId: $userId) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guests
      createdAt
      listing {
        id
        title
        imageUrl
        location
        city
        country
        host {
          id
          name
          avatar
        }
      }
      paymentStatus
      specialRequests
    }
  }
`;

export const GET_BOOKING_DETAILS = gql`
  query GetBookingDetails($id: ID!) {
    booking(id: $id) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guests
      createdAt
      updatedAt
      listing {
        id
        title
        description
        imageUrl
        location
        city
        country
        price
        amenities
        maxGuests
        bedrooms
        bathrooms
        host {
          id
          name
          avatar
          email
          phone
          responseRate
          responseTime
        }
      }
      payment {
        id
        amount
        status
        method
        createdAt
      }
      specialRequests
      cancellationPolicy
      houseRules
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guests
      createdAt
      listing {
        id
        title
      }
    }
  }
`;

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: BookingStatus!) {
    updateBookingStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const GET_HOST_BOOKINGS = gql`
  query GetHostBookings($hostId: ID!, $filters: HostBookingFilters) {
    hostBookings(hostId: $hostId, filters: $filters) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guests
      createdAt
      guest {
        id
        name
        email
        avatar
        phone
      }
      listing {
        id
        title
        location
        city
      }
      paymentStatus
      specialRequests
    }
  }
`;

export const GET_BOOKING_ANALYTICS = gql`
  query GetBookingAnalytics($hostId: ID!, $period: AnalyticsPeriod!) {
    bookingAnalytics(hostId: $hostId, period: $period) {
      totalBookings
      confirmedBookings
      pendingBookings
      cancelledBookings
      totalRevenue
      averageBookingValue
      occupancyRate
      monthlyStats {
        month
        bookings
        revenue
        occupancyRate
      }
      popularDates {
        date
        bookings
      }
      guestDemographics {
        country
        count
      }
    }
  }
`;

export const GET_UPCOMING_BOOKINGS = gql`
  query GetUpcomingBookings($userId: ID!, $days: Int!) {
    upcomingBookings(userId: $userId, days: $days) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guests
      listing {
        id
        title
        imageUrl
        location
        city
      }
      daysUntilCheckIn
    }
  }
`;

export const GET_RECENT_BOOKINGS = gql`
  query GetRecentBookings($userId: ID!, $limit: Int!) {
    recentBookings(userId: $userId, limit: $limit) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guests
      createdAt
      listing {
        id
        title
        imageUrl
        location
      }
    }
  }
`;

export const GET_BOOKING_CALENDAR = gql`
  query GetBookingCalendar($hostId: ID!, $month: Int!, $year: Int!) {
    bookingCalendar(hostId: $hostId, month: $month, year: $year) {
      date
      status
      bookingCount
      bookings {
        id
        checkInDate
        checkOutDate
        status
        guest {
          name
        }
      }
    }
  }
`;

export const SEARCH_BOOKINGS = gql`
  query SearchBookings($query: String!, $filters: BookingSearchFilters) {
    searchBookings(query: $query, filters: $filters) {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
      guest {
        name
        email
      }
      listing {
        title
        location
      }
    }
  }
`;

export const GET_BOOKING_STATS = gql`
  query GetBookingStats {
    bookingStats {
      totalBookings
      activeBookings
      pendingBookings
      cancelledBookings
      totalRevenue
      averageBookingDuration
      popularDestinations {
        city
        bookings
      }
      monthlyTrend {
        month
        bookings
        revenue
      }
    }
  }
`;

export const GET_BOOKING_REPORTS = gql`
  query GetBookingReports($hostId: ID!, $startDate: String!, $endDate: String!) {
    bookingReports(hostId: $hostId, startDate: $startDate, endDate: $endDate) {
      summary {
        totalBookings
        totalRevenue
        averageRating
        occupancyRate
      }
      detailedBookings {
        id
        bookingNumber
        checkInDate
        checkOutDate
        totalPrice
        guest {
          name
          email
        }
        status
      }
      revenueBreakdown {
        category
        amount
        percentage
      }
    }
  }
`;