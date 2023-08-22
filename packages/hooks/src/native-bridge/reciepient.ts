import { RecipientConfig } from "../tx";
import { ChainGetter } from "@keplr-wallet/stores";
import { useState } from "react";

/**
 * IBCRecipientConfig returns the recipient config for IBC transfer.
 * The recipient config's chain id should be the destination chain id for IBC.
 * But, actually, the recipient config's chain id would be set as the sending chain id if the channel not set.
 * So, you should remember that the recipient config's chain id is equalt to the sending chain id, if channel not set.
 */
export class NativeBridgeRecipientConfig extends RecipientConfig {
  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);
  }

  // reverse tje chain id for fetchub and ethereum
  override get chainId(): string {
    return super.chainId === "1" ? "fetchhub-4" : "1";
  }
}

export const useNativeBridgeRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(
    () => new NativeBridgeRecipientConfig(chainGetter, chainId)
  );
  config.setChain(chainId);

  return config;
};
