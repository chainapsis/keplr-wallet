import { WalletConfig } from "./config-queries";
import { gql } from "@apollo/client";
import { client } from "./client";

export const getWalletConfig = async (accessToken: string) => {
  const { data, errors } = await client.query({
    query: gql(WalletConfig),
    fetchPolicy: "no-cache",
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  if (errors) console.log("errors", errors);
  return data.walletConfig;
};
