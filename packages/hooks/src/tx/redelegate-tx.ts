import { ChainGetter } from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
  useSenderConfig,
} from "./index";
import { useStakedAmountConfig } from "./staked-amount";
import { QueriesStore } from "./internal";

export const useRedelegateTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  validatorAddress: string,
  initialGas: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const amountConfig = useStakedAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    validatorAddress,
    senderConfig
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, initialGas);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig,
    {
      additionAmountToNeedFee: false,
    }
  );
  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  const chainInfo = chainGetter.getChain(chainId);
  if (chainInfo.bech32Config) {
    recipientConfig.setBech32Prefix(chainInfo.bech32Config.bech32PrefixValAddr);
  }
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
