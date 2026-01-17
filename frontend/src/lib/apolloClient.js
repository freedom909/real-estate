import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';
import config from '../config/config';

const httpLink = createHttpLink({
  uri: `${config.API_URL}/graphql`,
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
   credentials: "include",
  cache: new InMemoryCache()
});

export default client;