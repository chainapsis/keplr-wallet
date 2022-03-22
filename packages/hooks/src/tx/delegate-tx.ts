import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  queriesStore: IQueriesStore<{}>,
  chainId: string,
  sender: string
) => {
  const [txConfig] = useState(
    () =>
      new DelegateAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        sender,
        undefined
      )
  );
  txConfig.setChain(chainId);
  txConfig.setSender(sender);

  return txConfig;
};

export const useDelegateTxConfig = (
  chainGetter: ChainGetter,
  // eslint-disable-next-line @typescript-eslint/ban-types
  queriesStore: IQueriesStore<{}>,
  chainId: string,
  gas: number,
  sender: string,
  ensEndpoint?: string
) => {
  const amountConfig = useDelegateAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    sender
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
