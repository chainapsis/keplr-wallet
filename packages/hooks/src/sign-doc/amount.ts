import { IBaseAmountConfig, TxChainSetter, UIProperties } from "../tx";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import { SignDocHelper } from "./index";
import { useState } from "react";

// This config helps the fee config to calculate that the fee is enough to send with considering
// the amount in the sign doc.
// This sets the amount as the sum of the messages in the sign doc if the message is known and can be parsed.
export class SignDocAmountConfig
  extends TxChainSetter
  implements IBaseAmountConfig
{
  @observable.ref
  protected signDocHelper?: SignDocHelper = undefined;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setSignDocHelper(signDocHelper: SignDocHelper) {
    this.signDocHelper = signDocHelper;
  }

  @computed
  get amount(): CoinPretty[] {
    // TODO
    return [];
  }

  @computed
  get uiProperties(): UIProperties {
    return {};
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }
}

export const useSignDocAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(
    () => new SignDocAmountConfig(chainGetter, chainId)
  );
  config.setChain(chainId);

  return config;
};
