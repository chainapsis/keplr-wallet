import { action, computed, makeObservable, observable } from "mobx";
import { Msg } from "@cosmjs/launchpad";
import { useState } from "react";
import { IFeeConfig, IMemoConfig } from "../tx";
import { cosmos, SignDocWrapper } from "@keplr/cosmos";
import Long from "long";

export * from "./amount";

export class SignDocHelper {
  @observable.ref
  protected _signDocWrapper?: SignDocWrapper = undefined;

  constructor(
    protected readonly feeConfig: IFeeConfig,
    protected readonly memoConfig: IMemoConfig
  ) {
    makeObservable(this);
  }

  @computed
  get signDocWrapper(): SignDocWrapper | undefined {
    if (!this._signDocWrapper) {
      return undefined;
    }

    const stdFee = this.feeConfig.toStdFee();

    if (this._signDocWrapper.mode === "amino") {
      const signDoc = {
        ...this._signDocWrapper.aminoSignDoc,
        fee: stdFee,
        memo: this.memoConfig.memo,
      };

      return SignDocWrapper.fromAminoSignDoc(signDoc);
    }

    const protoSignDoc = this._signDocWrapper.protoSignDoc;
    const fee = new cosmos.tx.v1beta1.Fee({
      gasLimit: Long.fromString(stdFee.gas),
      amount: stdFee.amount.map((fee) => {
        return {
          amount: fee.amount,
          denom: fee.denom,
        };
      }),
      granter: protoSignDoc.authInfo.fee?.granter,
      payer: protoSignDoc.authInfo.fee?.payer,
    });

    const newSignDoc = cosmos.tx.v1beta1.SignDoc.create({
      ...protoSignDoc.signDoc,
      ...{
        authInfoBytes: cosmos.tx.v1beta1.AuthInfo.encode({
          ...protoSignDoc.authInfo,
          ...{
            fee,
          },
        }).finish(),
      },
    });

    return SignDocWrapper.fromDirectSignDoc(newSignDoc);
  }

  @computed
  get signDocJson(): string {
    if (!this.signDocWrapper) {
      return "";
    }

    if (this.signDocWrapper.mode === "amino") {
      return JSON.stringify(this.signDocWrapper.aminoSignDoc, undefined, 2);
    } else {
      return JSON.stringify(
        this.signDocWrapper.protoSignDoc.toJSON(),
        undefined,
        2
      );
    }
  }

  @computed
  get msgs(): readonly Msg[] {
    return [];
  }

  @action
  setSignDocWrapper(signDoc: SignDocWrapper | undefined) {
    this._signDocWrapper = signDoc;
  }
}

export const useSignDocHelper = (
  feeConfig: IFeeConfig,
  memoConfig: IMemoConfig
) => {
  const [helper] = useState(new SignDocHelper(feeConfig, memoConfig));

  return helper;
};
