import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation RegisterUser($input: SignUpInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        email
        name
        nickname
        role
        picture
      }
    }
  }
`;

export class GraphQLService {
  constructor(client) {
    this.client = client;
  }

  async registerUser(signUpInput) {
    try {
      const { data } = await this.client.mutate({
        mutation: REGISTER_USER,
        variables: {
          input: signUpInput
        }
      });
      return data.register;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message);
    }
  }
}