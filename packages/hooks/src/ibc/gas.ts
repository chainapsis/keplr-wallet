import { GasConfig } from "../tx";
import { ChainGetter, MsgOpts } from "@keplr-wallet/stores";
import { action, makeObservable, observable } from "mobx";
import { useState } from "react";

export class IBCTransferGasConfig extends GasConfig {
  @observable.ref
  protected msgOpts: MsgOpts["ibc"]["transfer"];

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    msgOpts: MsgOpts["ibc"]["transfer"]
  ) {
    super(chainGetter, initialChainId, msgOpts.gas);

    this.msgOpts = msgOpts;

    makeObservable(this);
  }

  @action
  setMsgOpts(opts: MsgOpts["ibc"]["transfer"]) {
    this.msgOpts = opts;
  }

  get gas(): number {
    // If gas not set manually, assume that the tx is for MsgTransfer.
    if (this._gas <= 0) {
      return this.msgOpts.gas;
    }

    return this._gas;
  }
}

export const useIBCTransferGasConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  msgOpts: MsgOpts["ibc"]["transfer"]
) => {
  const [gasConfig] = useState(
    () => new IBCTransferGasConfig(chainGetter, chainId, msgOpts)
  );
  gasConfig.setChain(chainId);
  gasConfig.setMsgOpts(msgOpts);

  return gasConfig;
};
