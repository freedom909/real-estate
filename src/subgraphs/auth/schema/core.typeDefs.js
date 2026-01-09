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

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type User @key(fields: "id") {
    id: ID!
    email: String! @shareable
    role: Role! @shareable
  }
`
