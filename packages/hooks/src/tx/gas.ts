import { IGasConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";

export class GasConfig extends TxChainSetter implements IGasConfig {
  /*
   This field is used to handle the value from the input more flexibly.
   We use string because there is no guarantee that only number is input in input component.
   If the user has never set it, undefined is also allowed to indicate that it is a default value.
   */
  @observable
  protected _gasRaw: string | undefined = undefined;

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

    this._gasRaw = initialGas?.toString();
    this._allowZeroGas = allowZeroGas;

    makeObservable(this);
  }

  get gasRaw(): string {
    if (this._gasRaw == null) {
      return this.gas.toString();
    }

    return this._gasRaw;
  }

  @computed
  get gas(): number {
    // If the gasRaw is undefined,
    // it means that the user never input something yet.
    // In this case, it should be handled as gas is 0.
    // But, it can be overridden on the child class if it is needed.
    if (this._gasRaw == null) {
      return 0;
    }

    const r = parseInt(this._gasRaw);
    return Number.isNaN(r) ? 0 : r;
  }

  @action
  setGas(gas: number | string) {
    if (typeof gas === "number") {
      this._gasRaw = Math.floor(gas).toString();
      return;
    }

    if (gas === "") {
      this._gasRaw = gas;
      return;
    }

    // Gas must not be floated.
    if (!gas.includes(".")) {
      if (!/^[0-9]+$/.test(gas)) {
        // Explicitly, permit only numbers.
        return;
      }

      if (!Number.isNaN(Number.parseInt(gas))) {
        this._gasRaw = gas;
        return;
      }
    }
  }

  @computed
  get error(): Error | undefined {
    if (this._gasRaw === "") {
      return new Error("Gas not set");
    }

    if (this._gasRaw && Number.isNaN(this._gasRaw)) {
      return new Error("Gas is not valid number");
    }

    if (!Number.isInteger(this.gas)) {
      return new Error("Gas is not integer");
    }

    if (!this._allowZeroGas) {
      if (this.gas <= 0) {
        return new Error("Gas should be greater than 0");
      }
    } else {
      if (this.gas < 0) {
        return new Error("Gas should be greater or equal than 0");
      }
    }
    return;
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
