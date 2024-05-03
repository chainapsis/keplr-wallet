import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB, GRAPHQL_URL } from "../config";

export const fetchhubActivityClient = new ApolloClient({
  uri: GRAPHQL_URL.ACTIVITY_SERVER[CHAIN_ID_FETCHHUB],
  cache: new InMemoryCache(),
});

export const doradoActivityClient = new ApolloClient({
  uri: GRAPHQL_URL.ACTIVITY_SERVER[CHAIN_ID_DORADO],
  cache: new InMemoryCache(),
});
