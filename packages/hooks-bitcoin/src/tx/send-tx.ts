import { ChainGetter } from "@keplr-wallet/stores";
import { useSenderConfig } from "./sender";
import { useRecipientConfig } from "./recipient";
import { useAmountConfig } from "./amount";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: BitcoinQueriesStore,
  chainId: string,
  sender: string
  // initialGas: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig
  );

  return {
    senderConfig,
    recipientConfig,
    amountConfig,
  };
};
