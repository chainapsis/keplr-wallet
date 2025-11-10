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

  const chainInfo = chainGetter.getModularChain(chainId);
  if (!("cosmos" in chainInfo)) {
    throw new Error("cosmos module is not supported on this chain");
  }
  if (chainInfo.cosmos.bech32Config) {
    recipientConfig.setBech32Prefix(
      chainInfo.cosmos.bech32Config.bech32PrefixValAddr
    );
  }
  amountConfig.setCurrency(chainInfo.cosmos.stakeCurrency);

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    senderConfig,
  };
};
