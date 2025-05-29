import { IGasConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";

export class GasConfig extends TxChainSetter implements IGasConfig {
  /*
   This field is used to handle the value from the input more flexibly.
   We use string because there is no guarantee that only number is input in input component.
   */
  @observable
  protected _value: string = "";

  @observable
  protected _maxGasValue: string = "";

  /*
   There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
   In this case, there is no obligation to deal with it, but 0 gas is favorably allowed. This option is used for this case.
   */
  @observable
  protected _allowZeroGas?: boolean = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialGas?: number,
    allowZeroGas?: boolean
  ) {
    super(chainGetter, initialChainId);

    if (initialGas) {
      this._value = initialGas.toString();
    }
    this._allowZeroGas = allowZeroGas;

    makeObservable(this);
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string | number | { gas: string; maxGas: string }): void {
    if (typeof value === "number") {
      this._value = Math.ceil(value).toString();
    } else if (typeof value === "object") {
      this._value = value.gas;
      this._maxGasValue = value.maxGas;
    } else {
      this._value = value;
    }
  }

  get gas(): number {
    if (this.value.trim() === "") {
      return 0;
    }

    const num = Number.parseInt(this.value);
    if (Number.isNaN(num)) {
      return 0;
    }

    return num;
  }

  get maxGas(): number {
    // TODO: gas adjustment를 이 클래스에서 관리하도록
    if (this._maxGasValue.trim() === "") {
      return Math.ceil(this.gas * 1.5);
    }

    const num = Number.parseInt(this._maxGasValue);
    if (Number.isNaN(num)) {
      return Math.ceil(this.gas * 1.5);
    }

    return num;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this.value.trim() === "") {
      return {
        error: new Error("Gas not set"),
      };
    }

    const parsed = Number.parseFloat(this.value);
    if (Number.isNaN(parsed)) {
      return {
        error: new Error("Gas is not valid number"),
      };
    }

    if (this.value.includes(".") || !Number.isInteger(parsed)) {
      return {
        error: new Error("Gas is not integer"),
      };
    }

    if (!this._allowZeroGas) {
      if (this.gas <= 0) {
        return {
          error: new Error("Gas should be greater than 0"),
        };
      }
    } else {
      if (this.gas < 0) {
        return {
          error: new Error("Gas should be greater or equal than 0"),
        };
      }
    }

    return {};
  }
}

export const useGasConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialGas?: number
) => {
  const [txConfig] = useState(
    () => new GasConfig(chainGetter, chainId, initialGas)
  );
  txConfig.setChain(chainId);

  return txConfig;
};

/*
 There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
 In this case, there is no obligation to deal with it, but 0 gas is favorably allowed. This option is used for this case.
 */
export const useZeroAllowedGasConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialGas?: number
) => {
  const [txConfig] = useState(
    () => new GasConfig(chainGetter, chainId, initialGas, true)
  );
  txConfig.setChain(chainId);

  return txConfig;
};
