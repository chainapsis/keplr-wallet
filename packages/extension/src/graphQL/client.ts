import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { store } from "@chatStore/index";
import { setIsChatSubscriptionActive } from "@chatStore/messages-slice";
import {
  CHAIN_ID_DORADO,
  CHAIN_ID_FETCHHUB,
  GRAPHQL_URL,
} from "../config.ui.var";

export const client = new ApolloClient({
  uri: GRAPHQL_URL.MESSAGING_SERVER,
  cache: new InMemoryCache(),
});

export const httpLink = new HttpLink({
  uri: GRAPHQL_URL.MESSAGING_SERVER,
});

export const fetchhubActivityClient = new ApolloClient({
  uri: GRAPHQL_URL.ACTIVITY_SERVER[CHAIN_ID_FETCHHUB],
  cache: new InMemoryCache(),
});

export const doradoActivityClient = new ApolloClient({
  uri: GRAPHQL_URL.ACTIVITY_SERVER[CHAIN_ID_DORADO],
  cache: new InMemoryCache(),
});

export const createWSLink = (token: string) => {
  return new GraphQLWsLink(
    createClient({
      url: GRAPHQL_URL.SUBSCRIPTION_SERVER,
      connectionParams: {
        authorization: `Bearer ${token}`,
      },
      on: {
        connecting: () => {
          console.log("connecting");
        },
        opened: () => {
          console.log("opened");
          store.dispatch(setIsChatSubscriptionActive(true));
        },
      },
    })
  );
};
