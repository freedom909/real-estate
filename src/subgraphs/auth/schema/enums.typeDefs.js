import { gql } from 'graphql-tag'

export default gql`
  enum Role {
    ADMIN
    AGENT
    USER
    GUEST
    PENDING_AGENT
  }

  enum OAuthProvider {
    GOOGLE
    GITHUB
    FACEBOOK
    APPLE
    LINE
  }
`
