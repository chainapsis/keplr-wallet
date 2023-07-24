import { WalletConfig } from "./config-queries";
import { gql } from "@apollo/client";
import { store } from "@chatStore/index";
import { client } from "./client";

export const getWalletConfig = async () => {
  const state = store.getState();
  const { data, errors } = await client.query({
    query: gql(WalletConfig),
    fetchPolicy: "no-cache",
    context: {
      headers: {
        Authorization: `Bearer ${state.user.accessToken}`,
      },
    },
  });

  if (errors) console.log("errors", errors);
  return data.walletConfig;
};
