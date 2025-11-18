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
import { useSwapAmountConfig } from "./amount";
import { SwapQueries } from "@keplr-wallet/stores-internal";
import { AppCurrency } from "@keplr-wallet/types";
import { EthereumAccountStore } from "@keplr-wallet/stores-eth";

export const useSwapConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount, CosmwasmAccount]>,
  ethereumAccountStore: EthereumAccountStore,
  swapQueries: SwapQueries,
  chainId: string,
  sender: string,
  initialGas: number,
  outChainId: string,
  outCurrency: AppCurrency,
  disableSubFeeFromFaction: boolean,
  allowSwaps?: boolean
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);
  const amountConfig = useSwapAmountConfig(
    chainGetter,
    queriesStore,
    accountStore,
    ethereumAccountStore,
    swapQueries,
    chainId,
    senderConfig,
    outChainId,
    outCurrency,
    disableSubFeeFromFaction,
    allowSwaps
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
