import { google } from "../proto";
import * as $protobuf from "protobufjs";

import { cosmos, cosmwasm } from "../proto";
import { UnknownMessage } from "./unknown";

export * from "./unknown";

export class ProtoCodec {
  protected typeUrlMap: Map<
    string,
    {
      decode: (r: $protobuf.Reader | Uint8Array, l?: number) => any;
    }
  > = new Map();

  /**
   * Unpack the any to the registered message.
   * NOTE: If there is no matched message, it will not throw an error but return the `UnknownMessage` class.
   * @param iAny
   */
  unpackAny(iAny: google.protobuf.IAny): any {
    const any = new google.protobuf.Any(iAny);

    if (!this.typeUrlMap.has(any.type_url)) {
      return new UnknownMessage(any.type_url, any.value);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.typeUrlMap.get(any.type_url)!.decode(any.value);
  }

  registerAny(
    typeUrl: string,
    message: {
      decode: (r: $protobuf.Reader | Uint8Array, l?: number) => any;
    }
  ): void {
    this.typeUrlMap.set(typeUrl, message);
  }
}

export const defaultProtoCodec = new ProtoCodec();
defaultProtoCodec.registerAny(
  "/cosmos.bank.v1beta1.MsgSend",
  cosmos.bank.v1beta1.MsgSend
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgDelegate",
  cosmos.staking.v1beta1.MsgDelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgUndelegate",
  cosmos.staking.v1beta1.MsgUndelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  cosmos.staking.v1beta1.MsgBeginRedelegate
);
defaultProtoCodec.registerAny(
  "/cosmwasm.wasm.v1.MsgExecuteContract",
  cosmwasm.wasm.v1.MsgExecuteContract
);
