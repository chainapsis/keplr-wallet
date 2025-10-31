import { ChainGetter } from "@keplr-wallet/stores";
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
  useSenderConfig,
} from "./index";

import { QueriesStore } from "./internal";

export const useDelegateTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  validatorAddress: string,
  initialGas: number,
  disableSubFeeFromFaction: boolean,
  fractionSubFeeWeight?: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    disableSubFeeFromFaction,
    fractionSubFeeWeight
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, initialGas);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );
  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  const chainInfo = chainGetter.getModularChain(chainId);

  if ("cosmos" in chainInfo) {
    recipientConfig.setBech32Prefix(
      chainInfo.cosmos.bech32Config?.bech32PrefixValAddr ?? ""
    );
    recipientConfig.setValue(validatorAddress);
    amountConfig.setCurrency(chainInfo.cosmos.stakeCurrency);
  }

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    senderConfig,
  };
};
