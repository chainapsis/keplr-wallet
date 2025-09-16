import { ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { useState } from "react";

export class SenderConfig extends TxChainSetter implements ISenderConfig {
  @observable
  protected _value: string = "";
  @observable
  protected _isEthermintOrEvm: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialSender: string,
    initialIsEthermintOrEvm: boolean
  ) {
    super(chainGetter, initialChainId);

    this._value = initialSender;
    this._isEthermintOrEvm = initialIsEthermintOrEvm;

    makeObservable(this);
  }

  get sender(): string {
    return this._value;
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string): void {
    this._value = value;
  }

  get isEthermintOrEvm(): boolean {
    return this._isEthermintOrEvm;
  }

  @action
  setIsEthermintOrEvm(value: boolean) {
    this._isEthermintOrEvm = value;
  }

  get uiProperties(): UIProperties {
    return {};
  }
}

export const useSenderConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  isEthermintOrEvm: boolean
) => {
  const [config] = useState(
    () => new SenderConfig(chainGetter, chainId, sender, isEthermintOrEvm)
  );
  config.setChain(chainId);
  config.setValue(sender);
  config.setIsEthermintOrEvm(isEthermintOrEvm);

  return config;
};
