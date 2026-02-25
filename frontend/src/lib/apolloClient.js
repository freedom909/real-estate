import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

// Prefer central env over hardcoded URLs
// Gateway GraphQL endpoint
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';

const httpLink = createHttpLink({
  uri: GATEWAY_URL,
});

const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from session if it exists
  const session = await getSession();
  const token = session?.accessToken;
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;