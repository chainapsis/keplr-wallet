import { ChainGetter, MsgOpt } from "@keplr-wallet/stores";
import { ObservableQueryBalances } from "@keplr-wallet/stores/build/query/balances";
import { useFeeConfig, useMemoConfig } from "./index";
import { useGasConfig } from "./gas";
import { useAmountConfig } from "./amount";

export const useBasicTxConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  msgOpt: MsgOpt,
  sender: string,
  queryBalances: ObservableQueryBalances
) => {
  const amountConfig = useAmountConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, msgOpt.gas);
  const feeConfig = useFeeConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    amountConfig,
    gasConfig
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
  };
};
