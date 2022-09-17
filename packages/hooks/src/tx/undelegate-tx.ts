import { ChainGetter, IAccountStore, MsgOpt } from "@keplr-wallet/stores";

import { useFeeConfig } from "./fee";
import { GasConfig } from "./gas";
import { useMemoConfig } from "./memo";
import { useRecipientConfig } from "./recipient";
import { useStakedAmountConfig } from "./staked-amount";
import { makeObservable, override } from "mobx";
import { useState } from "react";
import { QueriesStore } from "./internal";

export class UndelegateGasConfig extends GasConfig {
  constructor(
    chainGetter: ChainGetter,
    protected readonly accountStore: IAccountStore<{
      cosmos: {
        readonly msgOpts: {
          readonly undelegate: MsgOpt;
        };
      };
    }>,
    initialChainId: string
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @override
  get gas(): number {
    // If gas not set manually, assume that the tx is for MsgTransfer.
    if (this._gasRaw == null) {
      return this.accountStore.getAccount(this.chainId).cosmos.msgOpts
        .undelegate.gas;
    }

    return super.gas;
  }
}

export const useUndelegateGasConfig = (
  chainGetter: ChainGetter,
  accountStore: IAccountStore<{
    cosmos: {
      readonly msgOpts: {
        readonly undelegate: MsgOpt;
      };
    };
  }>,
  chainId: string
) => {
  const [gasConfig] = useState(
    () => new UndelegateGasConfig(chainGetter, accountStore, chainId)
  );
  gasConfig.setChain(chainId);

  return gasConfig;
};

export const useUndelegateTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  accountStore: IAccountStore<{
    cosmos: {
      readonly msgOpts: {
        readonly undelegate: MsgOpt;
      };
    };
  }>,
  chainId: string,
  sender: string,
  validatorAddress: string
) => {
  const amountConfig = useStakedAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    sender,
    validatorAddress
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useUndelegateGasConfig(chainGetter, accountStore, chainId);
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
  };
};
