import { ProtoSignDocDecoder } from "../decoder";
import { Coin, StdSignDoc } from "@cosmjs/launchpad";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { checkAndValidateADR36AminoSignDoc } from "../../adr-36";

export class SignDocWrapper {
  protected _protoSignDoc?: ProtoSignDocDecoder;

  public readonly isADR36SignDoc: boolean;

  public readonly mode: "amino" | "direct";

  constructor(protected readonly signDoc: StdSignDoc | SignDoc) {
    if ("msgs" in signDoc) {
      this.mode = "amino";
    } else {
      this.mode = "direct";
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

  static fromDirectSignDocBytes(signDocBytes: Uint8Array) {
    return new SignDocWrapper(SignDoc.decode(signDocBytes));
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
}
