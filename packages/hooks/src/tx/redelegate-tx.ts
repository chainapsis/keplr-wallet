import {
  ChainGetter,
  IQueriesStore,
  CosmosQueriesImpl,
} from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
} from "./index";
import { useStakedAmountConfig } from "./staked-amount";

export const useRedelegateTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore<{
    cosmos: Pick<CosmosQueriesImpl, "queryDelegations">;
  }>,
  chainId: string,
  gas: number,
  sender: string,
  srcValidatorAddress: string
) => {
  const amountConfig = useStakedAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    sender,
    srcValidatorAddress
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, gas);
  gasConfig.setGas(gas);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    sender,
    amountConfig,
    gasConfig,
    false
  );

  const recipientConfig = useRecipientConfig(chainGetter, chainId);
  recipientConfig.setBech32Prefix(
    chainGetter.getChain(chainId).bech32Config.bech32PrefixValAddr
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    srcValidatorAddress,
    dstValidatorAddress: recipientConfig.recipient,
  };
};
