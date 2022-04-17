import * as $protobuf from "protobufjs";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgExecuteContract } from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { UnknownMessage } from "./unknown";

export * from "./unknown";

export type AnyWithUnpacked =
  | Any
  | (Any & { unpacked: unknown; factory: ProtoFactory });

interface ProtoFactory {
  encode: (message: any, writer?: $protobuf.Writer) => $protobuf.Writer;
  decode: (r: $protobuf.Reader | Uint8Array, l?: number) => any;
  fromJSON: (object: any) => any;
  toJSON: (message: any) => unknown;
}

export class ProtoCodec {
  protected typeUrlMap: Map<string, ProtoFactory> = new Map();

  /**
   * Unpack the any to the registered message.
   * NOTE: If there is no matched message, it will not throw an error but return the `UnknownMessage` class.
   * @param any
   */
  unpackAny(any: Any): AnyWithUnpacked {
    if (!this.typeUrlMap.has(any.typeUrl)) {
      return new UnknownMessage(any.typeUrl, any.value);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const factory = this.typeUrlMap.get(any.typeUrl)!;
    const unpacked = factory.decode(any.value);

    return {
      ...any,
      unpacked,
      factory,
    };
  }

  registerAny(typeUrl: string, message: ProtoFactory): void {
    this.typeUrlMap.set(typeUrl, message);
  }
}

export const defaultProtoCodec = new ProtoCodec();
defaultProtoCodec.registerAny("/cosmos.bank.v1beta1.MsgSend", MsgSend);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgDelegate",
  MsgDelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgUndelegate",
  MsgUndelegate
);
defaultProtoCodec.registerAny(
  "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  MsgBeginRedelegate
);
defaultProtoCodec.registerAny(
  "/cosmwasm.wasm.v1.MsgExecuteContract",
  MsgExecuteContract
);
