import { gql } from 'graphql-tag'

export default gql`
input OAuthProfileInput {
  name: String
  avatar: String
}

input FindOrCreateOAuthUserInput {
  provider: OAuthProvider!
  providerUserId: String!
  email: String
  emailVerified: Boolean
  profile: OAuthProfileInput
}

type FindOrCreateOAuthUserPayload {
  userId: ID!
  email: String!
}

extend type Mutation {
  findOrCreateOAuthUser(
    input: FindOrCreateOAuthUserInput!
  ): FindOrCreateOAuthUserPayload!
}
`
