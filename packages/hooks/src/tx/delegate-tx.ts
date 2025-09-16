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
  isEvmOrEthermint: boolean,
  validatorAddress: string,
  initialGas: number,
  fractionSubFeeWeight?: number
) => {
  const senderConfig = useSenderConfig(
    chainGetter,
    chainId,
    sender,
    isEvmOrEthermint
  );
  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
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
  const chainInfo = chainGetter.getChain(chainId);
  if (chainInfo.bech32Config) {
    recipientConfig.setBech32Prefix(chainInfo.bech32Config.bech32PrefixValAddr);
  }
  recipientConfig.setValue(validatorAddress);
  amountConfig.setCurrency(chainGetter.getChain(chainId).stakeCurrency);

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    senderConfig,
  };
};
