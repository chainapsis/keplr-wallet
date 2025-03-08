import { ChainGetter } from "@keplr-wallet/stores";
import { useSenderConfig } from "./sender";
import { useRecipientConfig } from "./recipient";
import { useAmountConfig } from "./amount";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";
import { useFeeRateConfig } from "./fee-rate";
import { useFeeConfig } from "./fee";
import { useTxSizeConfig } from "./tx-size";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: BitcoinQueriesStore,
  chainId: string,
  sender: string,
  initialFeeRate?: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig
  );
  const txSizeConfig = useTxSizeConfig(chainGetter, chainId);

  const feeRateConfig = useFeeRateConfig(
    chainGetter,
    queriesStore,
    chainId,
    initialFeeRate
  );

  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    txSizeConfig,
    feeRateConfig
  );

  amountConfig.setFeeConfig(feeConfig);

  return {
    senderConfig,
    recipientConfig,
    amountConfig,
    txSizeConfig,
    feeRateConfig,
    feeConfig,
  };
};
