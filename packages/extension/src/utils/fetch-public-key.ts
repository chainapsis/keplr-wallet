import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { GetMessagingPublicKey } from "@keplr-wallet/background/build/messaging";

export const fetchPublicKey = async (
  accessToken: string,
  chainId: string,
  targetAddress: string
) => {
  try {
    const requester = new InExtensionMessageRequester();
    return await requester.sendMessage(
      BACKGROUND_PORT,
      new GetMessagingPublicKey(chainId, accessToken, targetAddress)
    );
  } catch (error: any) {
    console.log(error);
  }
};
