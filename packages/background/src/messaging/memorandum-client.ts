import {
  ApolloClient,
  InMemoryCache,
  gql,
  DefaultOptions,
} from "@apollo/client";
import { PrivacySetting, PubKey } from "./types";

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};
// export const MESSAGING_SERVER =
//   "https://messaging-server.sandbox-london-b.fetch-ai.com/graphql";
export const MESSAGING_SERVER = "https://messaging.fetch-ai.network/graphql";
// export const MESSAGING_SERVER = "http://localhost:4000/graphql";
const client = new ApolloClient({
  uri: MESSAGING_SERVER,
  cache: new InMemoryCache(),
  defaultOptions,
});

export const registerPubKey = async (
  accessToken: string,
  messagingPubKey: string,
  walletAddress: string,
  privacySetting: PrivacySetting,
  channelId: string
): Promise<void> => {
  try {
    await client.mutate({
      mutation: gql(`mutation Mutation($publicKeyDetails: InputPublicKey!) {
        updatePublicKey(publicKeyDetails: $publicKeyDetails) {
          publicKey
          privacySetting
        }
      }`),
      variables: {
        publicKeyDetails: {
          publicKey: messagingPubKey,
          address: walletAddress,
          channelId,
          privacySetting,
        },
      },
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export const getPubKey = async (
  accessToken: string,
  targetAddress: string,
  channelId: string
): Promise<PubKey> => {
  try {
    const { data } = await client.query({
      query: gql(`query Query($address: String!, $channelId: ChannelId!) {
        publicKey(address: $address, channelId: $channelId) {
          publicKey
          privacySetting
        }
      }`),
      variables: {
        address: targetAddress,
        channelId,
      },
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    return {
      publicKey: data.publicKey && data.publicKey.publicKey,
      privacySetting: data.publicKey && data.publicKey.privacySetting,
    };
  } catch (e) {
    console.log(e);
    return {
      publicKey: undefined,
      privacySetting: undefined,
    };
  }
};
