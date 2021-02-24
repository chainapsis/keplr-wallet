import { ProtoSignDocDecoder } from "../decoder";
import { Coin, StdSignDoc } from "@cosmjs/launchpad";

import { Buffer } from "buffer/";
import { cosmos } from "../proto";

export class SignDocWrapper {
  protected _protoSignDoc?: ProtoSignDocDecoder;

  protected _aminoSignDoc?: StdSignDoc;

  constructor(
    public readonly mode: "amino" | "direct",
    protected readonly message: Uint8Array
  ) {}

  static fromAminoSignDoc(signDoc: StdSignDoc) {
    const wrapper = new SignDocWrapper("amino", new Uint8Array(0));
    wrapper._aminoSignDoc = signDoc;
    return wrapper;
  }

  static fromDirectSignDoc(signDoc: cosmos.tx.v1beta1.SignDoc) {
    const wrapper = new SignDocWrapper("direct", new Uint8Array(0));
    wrapper._protoSignDoc = new ProtoSignDocDecoder(signDoc);
    return wrapper;
  }

  clone(): SignDocWrapper {
    return new SignDocWrapper(this.mode, this.message);
  }

  get protoSignDoc(): ProtoSignDocDecoder {
    if (!this._protoSignDoc) {
      this._protoSignDoc = ProtoSignDocDecoder.decode(this.message);
    }

    return this._protoSignDoc;
  }

  get aminoSignDoc(): StdSignDoc {
    if (!this._aminoSignDoc) {
      this._aminoSignDoc = JSON.parse(Buffer.from(this.message).toString());
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._aminoSignDoc!;
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
      return this.protoSignDoc.authInfo.fee?.gasLimit?.toNumber() ?? 0;
    }

    return parseInt(this.aminoSignDoc.fee.gas);
  }
}
