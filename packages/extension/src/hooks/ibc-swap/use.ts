import {
  ChainGetter,
  CosmosAccount,
  CosmwasmAccount,
  IAccountStoreWithInjects,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSenderConfig,
} from "@keplr-wallet/hooks";
import { useIBCSwapAmountConfig } from "./amount";
import { SkipQueries } from "../../stores/skip";
import { AppCurrency } from "@keplr-wallet/types";

export const useIBCSwapConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount, CosmwasmAccount]>,
  skipQueries: SkipQueries,
  chainId: string,
  sender: string,
  initialGas: number,
  outChainId: string,
  outCurrency: AppCurrency,
  swapFeeBps: number
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const amountConfig = useIBCSwapAmountConfig(
    chainGetter,
    queriesStore,
    accountStore,
    skipQueries,
    chainId,
    senderConfig,
    outChainId,
    outCurrency,
    swapFeeBps
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

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    senderConfig,
  };
};
