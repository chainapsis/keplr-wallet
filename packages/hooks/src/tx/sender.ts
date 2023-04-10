import { ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { useState } from "react";

export class SenderConfig extends TxChainSetter implements ISenderConfig {
  @observable
  protected _value: string = "";

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialSender: string
  ) {
    super(chainGetter, initialChainId);

    this._value = initialSender;

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

  get uiProperties(): UIProperties {
    return {};
  }
}

export const useSenderConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string
) => {
  const [config] = useState(
    () => new SenderConfig(chainGetter, chainId, sender)
  );
  config.setChain(chainId);
  config.setValue(sender);

  return config;
};
