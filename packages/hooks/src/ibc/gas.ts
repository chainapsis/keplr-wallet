import { GasConfig } from "../tx";
import { ChainGetter, IAccountStore, MsgOpt } from "@keplr-wallet/stores";
import { makeObservable, override } from "mobx";
import { useState } from "react";

export class IBCTransferGasConfig extends GasConfig {
  constructor(
    chainGetter: ChainGetter,
    protected readonly accountStore: IAccountStore<{
      cosmos: {
        readonly msgOpts: {
          readonly ibcTransfer: MsgOpt;
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
        .ibcTransfer.gas;
    }

    return super.gas;
  }
}

export const useIBCTransferGasConfig = (
  chainGetter: ChainGetter,
  accountStore: IAccountStore<{
    cosmos: {
      readonly msgOpts: {
        readonly ibcTransfer: MsgOpt;
      };
    };
  }>,
  chainId: string
) => {
  const [gasConfig] = useState(
    () => new IBCTransferGasConfig(chainGetter, accountStore, chainId)
  );
  gasConfig.setChain(chainId);

  return gasConfig;
};
