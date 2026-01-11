import { gql } from 'graphql-tag'

export default gql`
schema
  @link(
    url: "https://specs.apollo.dev/federation/v2.8"
    import: ["@key", "@shareable"]
  ) {
  query: Query
  mutation: Mutation
}

directive @auth(requires: [Role!] = []) on FIELD_DEFINITION | OBJECT
directive @public on FIELD_DEFINITION

type AuthTokens {
  accessToken: String!
  refreshToken: String!
}

type User @key(fields: "id") {
  id: ID!
  email: String! @shareable
  role: Role! @shareable
}

enum Role {
  ADMIN
  AGENT
  USER
  GUEST
  PENDING_AGENT
}

type Query {
  me: User @auth
  _empty: String
}

type Mutation {
  login(email: String!, password: String!): AuthPayload! @public
  register(email: String!, password: String!): AuthPayload! @public
  oauthLogin(provider: OAuthProvider!, code: String!): AuthPayload! @public
  refreshToken(refreshToken: String!): AuthPayload!
  oauthLoginWithIdToken(provider: OAuthProvider!, idToken: String!): AuthPayload! @public
  linkOAuth(provider: OAuthProvider!, code: String!): Boolean! @auth(requires: [USER])
  unlinkOAuth(provider: OAuthProvider!): Boolean! @auth(requires: [USER])
}

type AuthPayload {
  user: User!
  accessToken: String!
  refreshToken: String!
}

enum OAuthProvider {
  GOOGLE
  FACEBOOK
  GITHUB
  APPLE
  LINE
  LOCAL
}

input OAuthUserInput {
  email: String!
  fullname: String
  picture: String
}
`
