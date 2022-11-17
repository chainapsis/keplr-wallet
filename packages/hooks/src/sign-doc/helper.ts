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
import { StdFee } from "@keplr-wallet/types";
import { Mutable } from "utility-types";

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
      const aminoSignDoc = this._signDocWrapper.aminoSignDoc;

      const signDoc = {
        ...aminoSignDoc,
        // XXX: Set fee payer/granter if the requested sign doc has fee payer/granter.
        //      Currently, there is no support for fee delegation within keplr,
        //      but this handling is essential for external services that set fee payer/granter.
        fee: (() => {
          const fee = { ...stdFee } as Mutable<StdFee>;

          if (aminoSignDoc.fee.feePayer) {
            // XXX: This part is not standard. This is only used for ethermint EIP-712 signing.
            fee.feePayer = aminoSignDoc.fee.feePayer;
          }
          if (aminoSignDoc.fee.granter) {
            fee.granter = aminoSignDoc.fee.granter;
          }
          if (aminoSignDoc.fee.payer) {
            fee.payer = aminoSignDoc.fee.payer;
          }

          return fee;
        })(),
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
