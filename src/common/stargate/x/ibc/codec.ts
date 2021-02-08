import { Codec } from "@chainapsis/ts-amino";
import { MsgTransfer } from "./msgs";

export function registerCodec(codec: Codec) {
  codec.registerConcrete("cosmos-sdk/MsgTransfer", MsgTransfer.prototype);
}
