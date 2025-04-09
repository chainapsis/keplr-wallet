import { ChainGetter } from "@keplr-wallet/stores";
import { useSenderConfig } from "./sender";
import { useRecipientConfig } from "./recipient";
import { useAmountConfig } from "./amount";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";
import { useFeeRateConfig } from "./fee-rate";
import { useFeeConfig } from "./fee";
import { useTxSizeConfig } from "./tx-size";
import { useAvailableBalanceConfig } from "./available-balance";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: BitcoinQueriesStore,
  chainId: string,
  sender: string,
  initialFeeRate?: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  const availableBalanceConfig = useAvailableBalanceConfig(
    chainGetter,
    chainId
  );
  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    availableBalanceConfig
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
    feeRateConfig,
    availableBalanceConfig
  );

  amountConfig.setFeeConfig(feeConfig);

  return {
    senderConfig,
    recipientConfig,
    amountConfig,
    availableBalanceConfig,
    txSizeConfig,
    feeRateConfig,
    feeConfig,
  };
};
