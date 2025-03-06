import { IFeeRateConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";

export class FeeRateConfig extends TxChainSetter implements IFeeRateConfig {
  /*
   This field is used to handle the value from the input more flexibly.
   We use string because there is no guarantee that only number is input in input component.
   */
  @observable
  protected _value: string = "";

  /*
   There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
   In this case, there is no obligation to deal with it, but 0 fee rate is favorably allowed. This option is used for this case.
   */
  @observable
  protected _allowZeroFeeRate?: boolean = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialFeeRate?: number,
    allowZeroFeeRate?: boolean
  ) {
    super(chainGetter, initialChainId);

    if (initialFeeRate) {
      this._value = initialFeeRate.toString();
    }
    this._allowZeroFeeRate = allowZeroFeeRate;

    makeObservable(this);
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string | number): void {
    if (typeof value === "number") {
      this._value = value.toString();
    } else {
      this._value = value;
    }
  }

  get feeRate(): number {
    if (this.value.trim() === "") {
      return 0;
    }

    const num = Number.parseFloat(this.value);
    if (Number.isNaN(num)) {
      return 0;
    }

    return num;
  }

  @computed
  get uiProperties(): UIProperties {
    if (this.value.trim() === "") {
      return {
        error: new Error("Fee rate not set"),
      };
    }

    const parsed = Number.parseFloat(this.value);
    if (Number.isNaN(parsed)) {
      return {
        error: new Error("Fee rate is not valid number"),
      };
    }

    if (!this._allowZeroFeeRate) {
      if (this.feeRate <= 0) {
        return {
          error: new Error("Fee rate should be greater than 0"),
        };
      }
    } else {
      if (this.feeRate < 0) {
        return {
          error: new Error("Fee rate should be greater or equal than 0"),
        };
      }
    }

    return {};
  }
}

export const useFeeRateConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialFeeRate?: number
) => {
  const [txConfig] = useState(
    () => new FeeRateConfig(chainGetter, chainId, initialFeeRate)
  );
  txConfig.setChain(chainId);

  return txConfig;
};

/*
 There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
 In this case, there is no obligation to deal with it, but 0 fee rate is favorably allowed. This option is used for this case.
 */
export const useZeroAllowedFeeRateConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialFeeRate?: number
) => {
  const [txConfig] = useState(
    () => new FeeRateConfig(chainGetter, chainId, initialFeeRate, true)
  );
  txConfig.setChain(chainId);

  return txConfig;
};
