 // src/subgraphs/auth/services/oauth.service.js
import { gql } from "graphql-tag";
import apolloClient  from "../../../../shared/apollo/apolloClient.js"; 

 async function oauthLogin(email, profile) {
  // 1. Query the User subgraph for existing user
  const { data } = await apolloClient.query({
    query: gql`
      query userByEmail($email: String!) {
        userByEmail(email: $email) {
          id
          email
          role
          status
        }
      }
    `,
    variables: { email },
  });

  let user = data.userByEmail;

  // 2. If user doesn't exist, create one via mutation in User subgraph
  if (!user) {
    const { data: newData } = await apolloClient.mutate({
      mutation: gql`
        mutation createOAuthUser($input: CreateOAuthUserInput!) {
          createOAuthUser(input: $input) {
            id
            email
            role
          }
        }
      `,
      variables: {
        input: { email, profile },
      },
    });
    user = newData.createOAuthUser;
  }

  // 3. Return user to the auth flow (issue JWT, etc)
  return user;
}
export default oauthLogin;