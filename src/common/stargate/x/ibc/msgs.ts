import { Amino, Codec } from "@chainapsis/ts-amino";
const { Field, DefineStruct } = Amino;
import { Msg } from "@chainapsis/cosmosjs/core/tx";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import bigInteger from "big-integer";

const Buffer = require("buffer/").Buffer;

@DefineStruct()
export class Height {
  @Field.Uint64(0, {
    jsonName: "revision_number"
  })
  public revisionNumber: bigInteger.BigInteger;

  @Field.Uint64(1, {
    jsonName: "revision_height"
  })
  public revisionHeight: bigInteger.BigInteger;

  constructor(revisionNumber: string, revisionHeight: string) {
    this.revisionNumber = bigInteger(revisionNumber, 10);
    this.revisionHeight = bigInteger(revisionHeight, 10);
  }
}

@DefineStruct()
export class MsgTransfer extends Msg {
  @Field.String(0, {
    jsonName: "source_port"
  })
  public sourcePort: string;

  @Field.String(1, {
    jsonName: "source_channel"
  })
  public sourceChannel: string;

  @Field.Defined(2, {
    jsonName: "token"
  })
  public token: Coin;

  @Field.Defined(3, {
    jsonName: "sender"
  })
  public sender: AccAddress;

  @Field.Defined(4, {
    jsonName: "receiver"
  })
  public receiver: AccAddress;

  @Field.Defined(5, {
    jsonName: "timeout_height"
  })
  public timeoutHeight: Height;

  @Field.Uint64(6, {
    jsonName: "timeout_timestamp"
  })
  public timeoutTimestamp: bigInteger.BigInteger;

  constructor(
    sourcePort: string,
    sourceChannel: string,
    token: Coin,
    sender: AccAddress,
    receiver: AccAddress,
    timeoutHeight: Height,
    timeoutTimestamp: string
  ) {
    super();
    this.sourcePort = sourcePort;
    this.sourceChannel = sourceChannel;
    this.token = token;
    this.sender = sender;
    this.receiver = receiver;
    this.timeoutHeight = timeoutHeight;
    this.timeoutTimestamp = bigInteger(timeoutTimestamp, 10);
  }

  public getSigners(): AccAddress[] {
    return [this.sender];
  }

  getSignBytes(codec: Codec): Uint8Array {
    const signBytes = super.getSignBytes(codec);

    const json = JSON.parse(Buffer.from(signBytes).toString());
    if (json.value.timeout_height.revision_number === "0") {
      delete json.value.timeout_height.revision_number;
    }

    return Buffer.from(JSON.stringify(json));
  }

  public validateBasic(): void {
    // TODO
  }
}
