import { gql } from 'graphql-tag'

export default gql`
  directive @auth(
    requires: [Role!] = []
  ) on FIELD_DEFINITION | OBJECT

  directive @public on FIELD_DEFINITION

  directive @requiresRole(
    role: Role!
  ) on FIELD_DEFINITION
`
