import {
  SignDoc,
  TxBody,
  AuthInfo,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import {
  AnyWithUnpacked,
  defaultProtoCodec,
  ProtoCodec,
  UnknownMessage,
} from "../codec";

export class ProtoSignDocDecoder {
  public static decode(bytes: Uint8Array): ProtoSignDocDecoder {
    return new ProtoSignDocDecoder(SignDoc.decode(bytes));
  }

  protected _txBody?: TxBody;
  protected _authInfo?: AuthInfo;

  constructor(
    public readonly signDoc: SignDoc,
    protected readonly protoCodec: ProtoCodec = defaultProtoCodec
  ) {}

  get txBody(): TxBody {
    if (!this._txBody) {
      this._txBody = TxBody.decode(this.signDoc.bodyBytes);
    }

    return this._txBody;
  }

  get txMsgs(): AnyWithUnpacked[] {
    const msgs: AnyWithUnpacked[] = [];
    for (const msg of this.txBody.messages) {
      msgs.push(this.protoCodec.unpackAny(msg));
    }

    return msgs;
  }

  get authInfo(): AuthInfo {
    if (!this._authInfo) {
      this._authInfo = AuthInfo.decode(this.signDoc.authInfoBytes);
    }

    return this._authInfo;
  }

  get chainId(): string {
    return this.signDoc.chainId;
  }

  get accountNumber(): string {
    return this.signDoc.accountNumber.toString();
  }

  toBytes(): Uint8Array {
    return SignDoc.encode(this.signDoc).finish();
  }

  toJSON(): any {
    return {
      txBody: {
        ...(TxBody.toJSON(this.txBody) as any),
        ...{
          messages: this.txMsgs.map((msg) => {
            if (msg) {
              if (msg instanceof UnknownMessage) {
                return msg.toJSON();
              }
              if ("factory" in msg) {
                return msg.factory.toJSON(msg.unpacked);
              }
            }
            return msg;
          }),
        },
      },
      authInfo: AuthInfo.toJSON(this.authInfo),
      chainId: this.chainId,
      accountNumber: this.accountNumber,
    };
  }
}
