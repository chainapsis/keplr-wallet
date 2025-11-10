import {
  RequestCosmosSignAminoMsg,
  RequestCosmosSignDirectMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import Long from "long";
import { Keplr } from "@keplr-wallet/types";

export const getShouldTopUpSignOptions = (): {
  signAmino: Keplr["signAmino"];
  signDirect: Keplr["signDirect"];
} => {
  return {
    signAmino: async (chainId, signer, signDoc, signOptions) => {
      const msg = new RequestCosmosSignAminoMsg(chainId, signer, signDoc, {
        ...signOptions,
        forceTopUp: true,
      });
      return await new InExtensionMessageRequester().sendMessage(
        BACKGROUND_PORT,
        msg
      );
    },
    signDirect: async (chainId, signer, signDoc, signOptions) => {
      const msg = new RequestCosmosSignDirectMsg(
        chainId,
        signer,
        {
          bodyBytes: signDoc.bodyBytes ?? undefined,
          authInfoBytes: signDoc.authInfoBytes ?? undefined,
          chainId: signDoc.chainId ?? undefined,
          accountNumber: signDoc.accountNumber?.toString() ?? undefined,
        },
        {
          ...signOptions,
          forceTopUp: true,
        }
      );
      const response = await new InExtensionMessageRequester().sendMessage(
        BACKGROUND_PORT,
        msg
      );
      return {
        ...response,
        signed: {
          ...response.signed,
          accountNumber: Long.fromString(response.signed.accountNumber),
        },
      };
    },
  };
};
