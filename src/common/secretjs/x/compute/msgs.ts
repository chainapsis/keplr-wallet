import { Amino, Type, Codec } from "@chainapsis/ts-amino";
const { Field, DefineStruct } = Amino;
import { Msg } from "@chainapsis/cosmosjs/core/tx";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { AxiosInstance } from "axios";

const Buffer = require("buffer/").Buffer;

@DefineStruct()
export class MsgExecuteContract extends Msg {
  @Field.Defined(0, {
    jsonName: "sender"
  })
  public sender: AccAddress;

  @Field.Defined(1, {
    jsonName: "contract"
  })
  public contract: AccAddress;

  @Field.Slice(
    2,
    {
      type: Type.Uint8
    },
    {
      jsonName: "msg"
    }
  )
  public msg?: Uint8Array;

  @Field.String(3, {
    jsonName: "callback_code_hash"
  })
  public callbackCodeHash: string;

  @Field.Slice(
    4,
    {
      type: Type.Defined
    },
    {
      jsonName: "sent_funds"
    }
  )
  public sentFunds: Coin[];

  // Due to the limitation of ts-animo implementation, don't support the callbackSig for now, and assume that it is null.
  /*
  @Field.Slice(
    5,
    {
      type: Type.Uint8
    },
    {
      jsonName: "callback_sig"
    }
  )
  public callbackSignature: Uint8Array | null;
   */

  public rawMsg: object;

  constructor(
    sender: AccAddress,
    contract: AccAddress,
    msg: object,
    callbackCodeHash: string,
    sentFunds: Coin[]
  ) {
    super();
    this.sender = sender;
    this.contract = contract;
    this.rawMsg = msg;
    this.callbackCodeHash = callbackCodeHash;
    this.sentFunds = sentFunds;
  }

  public getSigners(): AccAddress[] {
    return [this.sender];
  }

  public validateBasic(): void {
    // TODO
  }

  public getSignBytes(codec: Codec): Uint8Array {
    if (!this.msg) {
      throw new Error("Msg is not encrypted");
    }

    const signBytes = super.getSignBytes(codec);

    // Due to the limitation of ts-animo implementation, don't support the callbackSig for now, and assume that it is null.
    const json = JSON.parse(Buffer.from(signBytes).toString());
    // eslint-disable-next-line @typescript-eslint/camelcase
    json.value.callback_sig = null;
    return Buffer.from(JSON.stringify(json));
  }

  public async encrypt(
    restInstance: AxiosInstance,
    encrypter: (contractCodeHash: string, msg: object) => Promise<Uint8Array>
  ) {
    const contractCodeHashResult = await restInstance.get<{
      result: string;
    }>(`/wasm/contract/${this.contract.toBech32()}/code-hash`);

    const contractCodeHash = contractCodeHashResult.data.result;

    this.msg = await encrypter(contractCodeHash, this.rawMsg);
  }
}
