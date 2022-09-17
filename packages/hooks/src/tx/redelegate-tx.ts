import { ChainGetter, IAccountStore, MsgOpt } from "@keplr-wallet/stores";

import { useFeeConfig } from "./fee";
import { GasConfig } from "./gas";
import { useMemoConfig } from "./memo";
import { useRecipientConfig } from "./recipient";
import { useStakedAmountConfig } from "./staked-amount";
import { makeObservable, override } from "mobx";
import { useState } from "react";
import { QueriesStore } from "./internal";

export class RedelegateGasConfig extends GasConfig {
  constructor(
    chainGetter: ChainGetter,
    protected readonly accountStore: IAccountStore<{
      cosmos: {
        readonly msgOpts: {
          readonly redelegate: MsgOpt;
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
        .redelegate.gas;
    }

    return super.gas;
  }
}

export const useRedelegateGasConfig = (
  chainGetter: ChainGetter,
  accountStore: IAccountStore<{
    cosmos: {
      readonly msgOpts: {
        readonly redelegate: MsgOpt;
      };
    };
  }>,
  chainId: string
) => {
  const [gasConfig] = useState(
    () => new RedelegateGasConfig(chainGetter, accountStore, chainId)
  );
  gasConfig.setChain(chainId);

  return gasConfig;
};

export const useRedelegateTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  accountStore: IAccountStore<{
    cosmos: {
      readonly msgOpts: {
        readonly redelegate: MsgOpt;
      };
    };
  }>,
  chainId: string,
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
  const gasConfig = useRedelegateGasConfig(chainGetter, accountStore, chainId);
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
