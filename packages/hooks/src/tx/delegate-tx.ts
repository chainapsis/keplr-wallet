import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableQueryBalances } from "@keplr-wallet/stores/build/query/balances";
import {
  AmountConfig,
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
} from "./index";
import { AppCurrency } from "@keplr-wallet/types";
import { useState } from "react";

export class DelegateAmountConfig extends AmountConfig {
  get sendableCurrencies(): AppCurrency[] {
    return [this.chainInfo.stakeCurrency];
  }
}

export const useDelegateAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances
) => {
  const [txConfig] = useState(
    () =>
      new DelegateAmountConfig(
        chainGetter,
        chainId,
        sender,
        undefined,
        queryBalances
      )
  );
  txConfig.setChain(chainId);
  txConfig.setQueryBalances(queryBalances);
  txConfig.setSender(sender);

  return txConfig;
};

export const useDelegateTxConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  gas: number,
  sender: string,
  queryBalances: ObservableQueryBalances,
  ensEndpoint?: string
) => {
  const amountConfig = useDelegateAmountConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, gas);
  gasConfig.setGas(gas);
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
  recipientConfig.setBech32Prefix(
    chainGetter.getChain(chainId).bech32Config.bech32PrefixValAddr
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
