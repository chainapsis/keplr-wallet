import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/provider";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  isAnyMultisigWallet,
  MessageRequesterExternal,
  RequestObiSignAndBroadcastMsg,
} from "@obi-wallet/common";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { rootStore } from "../../background/root-store";

class ConcreteKeplr extends Keplr {
  // noinspection JSUnusedGlobalSymbols
  public async obiSignAndBroadcast(
    address: string,
    messages: EncodeObject[]
  ): Promise<DeliverTxResponse> {
    const currentWallet = rootStore.walletsStore.currentWallet;

    invariant(currentWallet, "Expected `currentWallet` to be defined.");

    const msg = new RequestObiSignAndBroadcastMsg({
      id: currentWallet.id,
      encodeObjects: messages,
      multisig: isAnyMultisigWallet(currentWallet)
        ? currentWallet.currentAdmin
        : null,
      wrap: true,
    });
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}

export function useKeplr({ url }: { url: string }) {
  return useMemo(() => {
    return new ConcreteKeplr(
      "0.10.10",
      "core",
      new MessageRequesterExternal({
        url: url,
        origin: new URL(url).origin,
      })
    );
  }, [url]);
}
