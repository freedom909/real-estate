import { gql } from '@apollo/client';

export const LIST_LOCATIONS = gql`
  query ListLocations {
    locations {
      id
      name
      address
      city
      state
      country
      zip
      latitude
      longitude
      radius
      units
    }
  }
`;

export const GET_LOCATION = gql`
  query GetLocation($locationId: ID!) {
    locations(locationId: $locationId) {
      id
      name
      address
      city
      state
      country
      zip
      latitude
      longitude
      radius
      units
    }
  }
`;

export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      code
      success
      message
      location {
        id
        name
        city
        state
        country
        latitude
        longitude
        radius
        units
      }
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation UpdateLocation($locationId: ID!, $location: UpdateLocationInput) {
    updateLocation(locationId: $locationId, location: $location) {
      code
      success
      message
      location {
        id
        name
        address
        city
        state
        country
        zip
        latitude
        longitude
        radius
        units
      }
    }
  }
`;