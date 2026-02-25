"use client";

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql", // 改成你的 gateway
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };

  const token = localStorage.getItem("accessToken");
  console.log("token", token); //no output in the terminal

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});