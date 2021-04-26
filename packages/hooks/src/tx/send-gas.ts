import { GasConfig } from "./gas";
import { DenomHelper } from "@keplr-wallet/common";
import { ChainGetter } from "@keplr-wallet/stores";
import { IAmountConfig } from "./types";
import { useState } from "react";
import { CosmosMsgOpts, SecretMsgOpts } from "@keplr-wallet/stores";
import { action, makeObservable, observable } from "mobx";

type MsgOpts = CosmosMsgOpts & SecretMsgOpts;

export class SendGasConfig extends GasConfig {
  @observable.ref
  protected sendMsgOpts: MsgOpts["send"];

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly amountConfig: IAmountConfig,
    sendMsgOpts: MsgOpts["send"]
  ) {
    super(chainGetter, initialChainId);

    this.sendMsgOpts = sendMsgOpts;

    makeObservable(this);
  }

  @action
  setSendMsgOpts(opts: MsgOpts["send"]) {
    this.sendMsgOpts = opts;
  }

  get gas(): number {
    // If gas not set manually, assume that the tx is for MsgSend.
    // And, set the default gas according to the currency type.
    if (this._gas <= 0 && this.amountConfig.sendCurrency) {
      const denomHelper = new DenomHelper(
        this.amountConfig.sendCurrency.coinMinimalDenom
      );

      switch (denomHelper.type) {
        case "secret20":
          return this.sendMsgOpts.secret20.gas;
        default:
          return this.sendMsgOpts.native.gas;
      }
    }

    return this._gas;
  }
}

export const useSendGasConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  amountConfig: IAmountConfig,
  sendMsgOpts: MsgOpts["send"]
) => {
  const [gasConfig] = useState(
    () => new SendGasConfig(chainGetter, chainId, amountConfig, sendMsgOpts)
  );
  gasConfig.setChain(chainId);
  gasConfig.setSendMsgOpts(sendMsgOpts);

  return gasConfig;
};
