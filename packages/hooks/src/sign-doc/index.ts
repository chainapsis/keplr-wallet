import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";
import { IFeeConfig, IMemoConfig } from "../tx";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import {
  SignDoc,
  TxBody,
  AuthInfo,
  Fee,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { escapeHTML } from "@keplr-wallet/common";

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

    // If the sign doc is for ADR-36,
    // The fee and memo should be empty.
    // Ignore the fee and memo config, and just return itself.
    if (this._signDocWrapper.isADR36SignDoc) {
      return this._signDocWrapper;
    }

    const stdFee = this.feeConfig.toStdFee();

    if (this._signDocWrapper.mode === "amino") {
      const signDoc = {
        ...this._signDocWrapper.aminoSignDoc,
        fee: stdFee,
        memo: escapeHTML(this.memoConfig.memo),
      };

      return SignDocWrapper.fromAminoSignDoc(signDoc);
    }

    const protoSignDoc = this._signDocWrapper.protoSignDoc;
    const fee = Fee.fromPartial({
      gasLimit: stdFee.gas,
      amount: stdFee.amount.map((fee) => {
        return {
          amount: fee.amount,
          denom: fee.denom,
        };
      }),
      granter: protoSignDoc.authInfo.fee?.granter,
      payer: protoSignDoc.authInfo.fee?.payer,
    });

    const newSignDoc: SignDoc = {
      ...protoSignDoc.signDoc,
      ...{
        bodyBytes: TxBody.encode({
          ...protoSignDoc.txBody,
          ...{
            memo: this.memoConfig.memo,
          },
        }).finish(),
        authInfoBytes: AuthInfo.encode({
          ...protoSignDoc.authInfo,
          ...{
            fee,
          },
        }).finish(),
      },
    };

    return SignDocWrapper.fromDirectSignDoc(newSignDoc);
  }

  @computed
  get signDocJson(): any {
    if (!this.signDocWrapper) {
      return undefined;
    }

    if (this.signDocWrapper.mode === "amino") {
      return this.signDocWrapper.aminoSignDoc;
    } else {
      return this.signDocWrapper.protoSignDoc.toJSON();
    }
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
  const [helper] = useState(() => new SignDocHelper(feeConfig, memoConfig));

  return helper;
};
