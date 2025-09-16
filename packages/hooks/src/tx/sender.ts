import { ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { useState } from "react";

export class SenderConfig extends TxChainSetter implements ISenderConfig {
  @observable
  protected _value: string = "";
  @observable
  protected _isEvmOrEthermint: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialSender: string,
    initialisEvmOrEthermint: boolean
  ) {
    super(chainGetter, initialChainId);

    this._value = initialSender;
    this._isEvmOrEthermint = initialisEvmOrEthermint;

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

  get isEvmOrEthermint(): boolean {
    return this._isEvmOrEthermint;
  }

  @action
  setisEvmOrEthermint(value: boolean) {
    this._isEvmOrEthermint = value;
  }

  get uiProperties(): UIProperties {
    return {};
  }
}

export const useSenderConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  isEvmOrEthermint: boolean
) => {
  const [config] = useState(
    () => new SenderConfig(chainGetter, chainId, sender, isEvmOrEthermint)
  );
  config.setChain(chainId);
  config.setValue(sender);
  config.setisEvmOrEthermint(isEvmOrEthermint);

  return config;
};
