import { ChainGetter } from "@keplr-wallet/stores";
import { useSenderConfig } from "./sender";
import { useRecipientConfig } from "./recipient";
import { useAmountConfig } from "./amount";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";
import { useFeeRateConfig } from "./fee-rate";
import { useFeeConfig } from "./fee";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: BitcoinQueriesStore,
  chainId: string,
  sender: string,
  initialFeeRate: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig
  );
  const feeRateConfig = useFeeRateConfig(chainGetter, chainId, initialFeeRate);

  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    feeRateConfig
  );

  return {
    senderConfig,
    recipientConfig,
    amountConfig,
    feeRateConfig,
    feeConfig,
  };
};
