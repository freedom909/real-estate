export default `#graphql
  extend type Query {
    findUserByEmail(email: String!): User
  }

  type User @key(fields: "id") {
    id: ID!
    email: String!
    role: String
  }
`;