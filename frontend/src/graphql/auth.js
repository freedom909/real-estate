//src/graphql/mutations.js
import { gql } from '@apollo/client';
import { GOOGLE_SIGN_IN } from './graphql/mutations';
// 2. Use the `useMutation` hook to get the `signIn` function
const [signIn, { loading, error, data }] = useMutation(SIGN_IN);

export const GOOGLE_SIGN_IN = gql`
  mutation GoogleSignIn($input: SignInInput!) {
    signIn(input: $input) {
      code
      success
      message
      auth {
        token
        userId
        role
      }
      role
      userId
    }
  }
`;

const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      id
      name
      email
      picture
      role
      provider
    }
  }
`;

const REGISTER_USER = gql`
mutation Mutation($input: SignUpInput!) {
  signUp(input: $input) {
    role
    userId
    code
    message
    refreshToken
    success
    auth {
      token
    }
  }
}
`;

const handleGoogleLoginSuccess = async (response) => {
  try {
    const token = response.credential; // from Google

    const decoded = jwtDecode(token);
    const provider = "GOOGLE";

    const { data } = await signIn({ 
      mutation: SIGN_IN,
      variables: {
        input: {
          provider,
          token,
          oauthId: decoded.sub,
          refreshToken: null, 
        },
      },
    });

    console.log("Signed in user:", data.signIn);
  } catch (error) {
    console.log("Error signing in with Google:", error);
  }
};


