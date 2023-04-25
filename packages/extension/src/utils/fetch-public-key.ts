import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { GetMessagingPublicKey } from "@keplr-wallet/background/build/messaging";
import { GRAPHQL_URL } from "../config.ui.var";

export const fetchPublicKey = async (
  accessToken: string,
  chainId: string,
  targetAddress: string
) => {
  try {
    const requester = new InExtensionMessageRequester();
    return await requester.sendMessage(
      BACKGROUND_PORT,
      new GetMessagingPublicKey(
        GRAPHQL_URL.MESSAGING_SERVER,
        chainId,
        accessToken,
        targetAddress
      )
    );
  } catch (error: any) {
    console.log(error);
  }
};
