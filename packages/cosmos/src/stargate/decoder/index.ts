import {
  SignDoc,
  TxBody,
  AuthInfo,
  SignDocDirectAux,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { AnyWithUnpacked, defaultProtoCodec, ProtoCodec } from "../codec";

export class ProtoSignDocDecoder {
  public static decode(bytes: Uint8Array): ProtoSignDocDecoder {
    return new ProtoSignDocDecoder(SignDoc.decode(bytes));
  }

  protected _txBody?: TxBody;
  protected _authInfo?: AuthInfo;

  constructor(
    public readonly signDoc: SignDoc | SignDocDirectAux,
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
      if ("authInfoBytes" in this.signDoc) {
        this._authInfo = AuthInfo.decode(this.signDoc.authInfoBytes);
      } else {
        // 사실 direct aux에서 auth info를 만들어내는 것은 불가능하다.
        // 하지만 기존 코드를 재활용하기 위해서 필요하니 일단 적당히 만들어준다.
        const directAux = this.signDoc as SignDocDirectAux;
        this._authInfo = AuthInfo.fromJSON({
          signerInfos: [
            {
              publicKey: directAux.publicKey,
              modeInfo: {
                single: {
                  mode: "SIGN_MODE_DIRECT",
                },
              },
              sequence: directAux.sequence,
            },
          ],
          fee: {
            amount: [],
            gasLimit: "1",
            payer: "",
            granter: "",
          },
          tip: directAux.tip,
        });
      }
    }

    return this._authInfo;
  }

  get chainId(): string {
    return this.signDoc.chainId;
  }

  get accountNumber(): string {
    return this.signDoc.accountNumber.toString();
  }

  get tip():
    | {
        amount: { amount: string; denom: string }[];
        tipper: string;
      }
    | undefined {
    if (!this.authInfo.tip) {
      return undefined;
    }
    return {
      amount: this.authInfo.tip.amount.map((coin) => {
        return {
          amount: coin.amount,
          denom: coin.denom,
        };
      }),
      tipper: this.authInfo.tip.tipper,
    };
  }

  toBytes(): Uint8Array {
    if ("authInfoBytes" in this.signDoc) {
      return SignDoc.encode(this.signDoc).finish();
    }
    return SignDocDirectAux.encode(this.signDoc).finish();
  }

  toJSON(): any {
    if ("authInfoBytes" in this.signDoc) {
      return {
        txBody: {
          ...(TxBody.toJSON(this.txBody) as any),
          ...{
            messages: this.txMsgs.map((msg) => {
              return this.protoCodec.unpackedAnyToJSONRecursive(msg);
            }),
          },
        },
        authInfo: AuthInfo.toJSON(this.authInfo),
        chainId: this.chainId,
        accountNumber: this.accountNumber,
      };
    }
    return {
      txBody: {
        ...(TxBody.toJSON(this.txBody) as any),
        ...{
          messages: this.txMsgs.map((msg) => {
            return this.protoCodec.unpackedAnyToJSONRecursive(msg);
          }),
        },
      },
      chainId: this.chainId,
      accountNumber: this.accountNumber,
      publicKey: this.signDoc.publicKey,
      sequence: this.signDoc.sequence,
      tip: this.signDoc.tip,
    };
  }
}
