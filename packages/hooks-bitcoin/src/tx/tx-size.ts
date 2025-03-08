import { ITxSizeConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";

export class TxSizeConfig extends TxChainSetter implements ITxSizeConfig {
  @observable
  protected _value: string = "";

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setValue(value: string | number): void {
    if (typeof value === "number") {
      this._value = value.toString();
    } else {
      this._value = value;
    }
  }

  get value(): string {
    return this._value;
  }

  get txSize(): number {
    if (this._value.trim() === "") {
      return 0;
    }

    const num = Number.parseInt(this._value);
    if (Number.isNaN(num)) {
      return 0;
    }

    return num;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this._value.trim() === "") {
      return {
        error: new Error("Tx size not set"),
      };
    }

    const num = Number.parseInt(this._value);
    if (Number.isNaN(num)) {
      return {
        error: new Error("Tx size is not valid number"),
      };
    }

    return {};
  }
}

export const useTxSizeConfig = (chainGetter: ChainGetter, chainId: string) => {
  const [txConfig] = useState(() => new TxSizeConfig(chainGetter, chainId));
  txConfig.setChain(chainId);

  return txConfig;
};
