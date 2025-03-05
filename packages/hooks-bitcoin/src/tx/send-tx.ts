import { ChainGetter } from "@keplr-wallet/stores";
import { useSenderConfig } from "./sender";
import { useRecipientConfig } from "./recipient";
// import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string
  // initialGas: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const recipientConfig = useRecipientConfig(chainGetter, chainId);

  return {
    senderConfig,
    recipientConfig,
  };
};
