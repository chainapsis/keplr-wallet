import { ChainGetter, ObservableQueryBalances } from "@keplr-wallet/stores";
import { useFeeConfig, useMemoConfig, useRecipientConfig } from "./index";
import { useSendGasConfig } from "./send-gas";
import { useAmountConfig } from "./amount";
import { AccountStore } from "./send-types";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  accountStore: AccountStore,
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances,
  ensEndpoint?: string
) => {
  const amountConfig = useAmountConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useSendGasConfig(
    chainGetter,
    accountStore,
    chainId,
    amountConfig
  );
  const feeConfig = useFeeConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    amountConfig,
    gasConfig
  );
  // Due to the circular references between the amount config and gas/fee configs,
  // set the fee config of the amount config after initing the gas/fee configs.
  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId, ensEndpoint);

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
