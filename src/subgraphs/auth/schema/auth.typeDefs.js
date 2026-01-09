import { gql } from 'graphql-tag'

export default gql`
  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  extend type Mutation {
    login(email: String! password: String!): AuthPayload! @public
    refreshToken(refreshToken: String!): AuthPayload!
  }
`
