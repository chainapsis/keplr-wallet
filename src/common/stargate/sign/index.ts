import { cosmos } from "../proto";
import SignDoc = cosmos.tx.v1beta1.SignDoc;
import { defaultProtoCodec, ProtoCodec } from "../codec";

export class SignDocHelper {
  public static decode(bytes: Uint8Array): SignDocHelper {
    return new SignDocHelper(cosmos.tx.v1beta1.SignDoc.decode(bytes));
  }

  protected _txBody?: cosmos.tx.v1beta1.TxBody;
  protected _authInfo?: cosmos.tx.v1beta1.AuthInfo;

  constructor(
    protected readonly signDoc: SignDoc,
    protected readonly protoCodec: ProtoCodec = defaultProtoCodec
  ) {}

  get txBody(): cosmos.tx.v1beta1.TxBody {
    if (!this._txBody) {
      this._txBody = cosmos.tx.v1beta1.TxBody.decode(this.signDoc.bodyBytes);
    }

    return this._txBody;
  }

  get txMsgs(): any[] {
    const msgs: any[] = [];
    for (const msg of this.txBody.messages) {
      msgs.push(this.protoCodec.unpackAny(msg));
    }

    return msgs;
  }

  get authInfo(): cosmos.tx.v1beta1.AuthInfo {
    if (!this._authInfo) {
      this._authInfo = cosmos.tx.v1beta1.AuthInfo.decode(
        this.signDoc.authInfoBytes
      );
    }

    return this._authInfo;
  }

  get chainId(): string {
    return this.signDoc.chainId;
  }

  get accountNumber(): string {
    return this.signDoc.accountNumber.toString();
  }

  toString(): string {
    const pretty = {
      txBody: this.txBody.toJSON(),
      authInfo: this.authInfo.toJSON(),
      chainId: this.chainId,
      accountNumber: this.accountNumber
    };

    return JSON.stringify(pretty);
  }
}
