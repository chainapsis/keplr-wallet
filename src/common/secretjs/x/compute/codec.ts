import { Codec } from "@chainapsis/ts-amino";
import { MsgExecuteContract } from "./msgs";

export function registerCodec(codec: Codec) {
  codec.registerConcrete(
    "wasm/MsgExecuteContract",
    MsgExecuteContract.prototype
  );
}
