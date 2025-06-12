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
  protected _gasAdjustmentValue: string = "1.5";

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

  get gasAdjustmentValue(): string {
    return this._gasAdjustmentValue;
  }

  @action
  setValue(value: string | number): void {
    if (typeof value === "number") {
      this._value = Math.ceil(value).toString();
    } else {
      this._value = value;
    }
  }

  @action
  setGasAdjustmentValue(gasAdjustment: string | number) {
    if (typeof gasAdjustment === "number") {
      if (gasAdjustment < 0 || gasAdjustment > 2) {
        return;
      }

      this._gasAdjustmentValue = gasAdjustment.toString();
      return;
    }

    if (gasAdjustment === "") {
      this._gasAdjustmentValue = "";
      return;
    }

    if (gasAdjustment.startsWith(".")) {
      this._gasAdjustmentValue = "0" + gasAdjustment;
    }

    const num = parseFloat(gasAdjustment);
    if (Number.isNaN(num) || num < 0 || num > 2) {
      return;
    }

    this._gasAdjustmentValue = gasAdjustment;
  }

  get gasAdjustment(): number {
    if (this._gasAdjustmentValue === "") {
      return 0;
    }

    const num = parseFloat(this._gasAdjustmentValue);
    if (Number.isNaN(num) || num < 0) {
      return 0;
    }

    return num;
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
    return Math.ceil(this.gas * this.gasAdjustment);
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
