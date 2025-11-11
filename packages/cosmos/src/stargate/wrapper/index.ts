import { ProtoSignDocDecoder } from "../decoder";
import { Coin, StdFee, StdSignDoc } from "@keplr-wallet/types";
import {
  AuthInfo,
  Fee,
  SignDoc,
  SignDocDirectAux,
  TxBody,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { checkAndValidateADR36AminoSignDoc } from "../../adr-36";
import { Mutable } from "utility-types";
import { escapeHTML } from "@keplr-wallet/common";

export class SignDocWrapper {
  protected _protoSignDoc?: ProtoSignDocDecoder;

  public readonly isADR36SignDoc: boolean;

  public readonly mode: "amino" | "direct";

  public readonly isDirectAux: boolean = false;

  constructor(
    protected readonly signDoc: StdSignDoc | SignDoc | SignDocDirectAux
  ) {
    if ("msgs" in signDoc) {
      this.mode = "amino";
    } else {
      // direct나 direct aux나 사실 비슷비슷하다.
      // 기존의 로직을 활용하기 위해서 direct aux도 기본적으로는 direct로 취급한다.
      this.mode = "direct";

      this.isDirectAux = !("authInfoBytes" in signDoc);
    }

    if (this.mode === "amino") {
      // Check that the sign doc is for ADR-36.
      // The validation should be performed on the background process.
      // So, here, we check once more, but the validation related to bech32 is considered to be done in the background process.
      this.isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
        this.aminoSignDoc
      );
    } else {
      // Currently, only support amino sign doc for ADR-36
      this.isADR36SignDoc = false;
    }
  }

  static fromAminoSignDoc(signDoc: StdSignDoc) {
    return new SignDocWrapper(signDoc);
  }

  static fromDirectSignDoc(signDoc: SignDoc) {
    return new SignDocWrapper(signDoc);
  }

  static fromDirectAuxSignDoc(signDoc: SignDocDirectAux) {
    return new SignDocWrapper(signDoc);
  }

  static fromDirectSignDocBytes(signDocBytes: Uint8Array) {
    return new SignDocWrapper(SignDoc.decode(signDocBytes));
  }

  static fromDirectAuxSignDocBytes(signDocBytes: Uint8Array) {
    return new SignDocWrapper(SignDocDirectAux.decode(signDocBytes));
  }

  clone(): SignDocWrapper {
    return new SignDocWrapper(this.signDoc);
  }

  get protoSignDoc(): ProtoSignDocDecoder {
    if (this.mode === "amino") {
      throw new Error("Sign doc is encoded as Amino Json");
    }
    if ("msgs" in this.signDoc) {
      throw new Error("Unexpected error");
    }

    if (!this._protoSignDoc) {
      this._protoSignDoc = new ProtoSignDocDecoder(this.signDoc);
    }

    return this._protoSignDoc;
  }

  get aminoSignDoc(): StdSignDoc {
    if (this.mode === "direct") {
      throw new Error("Sign doc is encoded as Protobuf");
    }
    if (!("msgs" in this.signDoc)) {
      throw new Error("Unexpected error");
    }

    return this.signDoc;
  }

  get chainId(): string {
    if (this.mode === "direct") {
      return this.protoSignDoc.chainId;
    }

    return this.aminoSignDoc.chain_id;
  }

  get memo(): string {
    if (this.mode === "direct") {
      return this.protoSignDoc.txBody.memo;
    }

    return this.aminoSignDoc.memo;
  }

  get fees(): readonly Coin[] {
    if (this.mode === "direct") {
      const fees: Coin[] = [];
      for (const coinObj of this.protoSignDoc.authInfo.fee?.amount ?? []) {
        if (coinObj.denom == null || coinObj.amount == null) {
          throw new Error("Invalid fee");
        }
        fees.push({
          denom: coinObj.denom,
          amount: coinObj.amount,
        });
      }

      return fees;
    }

    return this.aminoSignDoc.fee.amount;
  }

  get payer(): string | undefined {
    if (this.mode === "direct") {
      return this.protoSignDoc.authInfo.fee?.payer;
    }

    return this.aminoSignDoc.fee.payer;
  }

  get granter(): string | undefined {
    if (this.mode === "direct") {
      return this.protoSignDoc.authInfo.fee?.granter;
    }

    return this.aminoSignDoc.fee.granter;
  }

  get gas(): number {
    if (this.mode === "direct") {
      if (this.protoSignDoc.authInfo.fee?.gasLimit) {
        return parseInt(this.protoSignDoc.authInfo.fee.gasLimit);
      } else {
        return 0;
      }
    }

    return parseInt(this.aminoSignDoc.fee.gas);
  }

  getTopUpOverridedWrapper(overrideStdFee: StdFee): SignDocWrapper {
    // If the sign doc is for ADR-36,
    // The fee and memo should be empty.
    if (this.isADR36SignDoc) {
      throw new Error("ADR-36 sign doc cannot be overrided");
    }

    if (this.mode === "amino") {
      const aminoSignDoc = this.aminoSignDoc;

      const signDoc = {
        ...aminoSignDoc,
        // XXX: Set fee payer/granter if the requested sign doc has fee payer/granter.
        //      Currently, there is no support for fee delegation within keplr,
        //      but this handling is essential for external services that set fee payer/granter.
        fee: (() => {
          const fee = { ...overrideStdFee } as Mutable<StdFee>;

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
        memo: escapeHTML(this.memo),
      };

      return SignDocWrapper.fromAminoSignDoc(signDoc);
    }

    if (this.isDirectAux) {
      throw new Error("Direct aux sign doc cannot be overrided");
    }

    const protoSignDoc = this.protoSignDoc;

    const fee = Fee.fromPartial({
      gasLimit: overrideStdFee.gas,
      amount: overrideStdFee.amount.map((fee) => {
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
            memo: this.memo,
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
}
