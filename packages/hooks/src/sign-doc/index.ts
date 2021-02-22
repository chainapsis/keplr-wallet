import { action, computed, makeObservable, observable } from "mobx";
import { Msg, StdSignDoc } from "@cosmjs/launchpad";
import { useState } from "react";
import { IFeeConfig, IMemoConfig } from "../tx";

export * from "./amount";

export class SignDocHelper {
  @observable.ref
  protected _signDoc?: StdSignDoc = undefined;

  constructor(
    protected readonly feeConfig: IFeeConfig,
    protected readonly memoConfig: IMemoConfig
  ) {
    makeObservable(this);
  }

  get signDoc(): StdSignDoc | undefined {
    if (!this._signDoc) {
      return undefined;
    }

    const stdFee = this.feeConfig.toStdFee();

    return {
      ...this._signDoc,
      fee: stdFee,
      memo: this.memoConfig.memo,
    };
  }

  @computed
  get msgs(): readonly Msg[] {
    if (!this.signDoc) {
      return [];
    }

    return this.signDoc.msgs;
  }

  @computed
  get signDocJson(): string {
    if (!this.signDoc) {
      return "";
    }

    return JSON.stringify(this.signDoc, undefined, 2);
  }

  @action
  setSignDoc(signDoc: StdSignDoc | undefined) {
    this._signDoc = signDoc;
  }
}

export const useSignDocHelper = (
  feeConfig: IFeeConfig,
  memoConfig: IMemoConfig
) => {
  const [helper] = useState(new SignDocHelper(feeConfig, memoConfig));

  return helper;
};
