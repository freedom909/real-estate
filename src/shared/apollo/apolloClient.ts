import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";
import fetch from "cross-fetch";

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:4000/graphql", // <-- your Apollo Gateway URL
    fetch,
  }),
  cache: new InMemoryCache(),
});

export default apolloClient;