import { KeyRingKeeper } from "../keyring/keeper";
import Axios, { AxiosInstance } from "axios";

import { Context, IContext } from "@everett-protocol/cosmosjs/core/context";
import { TendermintRPC } from "@everett-protocol/cosmosjs/rpc/tendermint";
import {
  ResultBroadcastTx,
  ResultBroadcastTxCommit
} from "@everett-protocol/cosmosjs/rpc/tx";

const Buffer = require("buffer/").Buffer;

export class BackgroundTxKeeper {
  constructor(private keyRingKeeper: KeyRingKeeper) {}

  async requestTx(
    chainId: string,
    txBytes: string,
    mode: "sync" | "async" | "commit"
  ) {
    const info = this.keyRingKeeper.getChainInfo(chainId);
    const instance = Axios.create({
      baseURL: info.rpc
    });

    // Do not await.
    BackgroundTxKeeper.sendTransaction(instance, txBytes, mode);

    return;
  }

  private static async sendTransaction(
    instance: AxiosInstance,
    txBytes: string,
    mode: "sync" | "async" | "commit"
  ) {
    const rpc = new TendermintRPC(
      new Context({
        rpcInstance: instance
      } as IContext)
    );

    let result: ResultBroadcastTx | ResultBroadcastTxCommit | undefined;

    try {
      new Notification("Tx is pending...");

      if (mode === "commit") {
        result = await rpc.broadcastTxCommit(Buffer.from(txBytes, "hex"));
      } else {
        result = await rpc.broadcastTx(Buffer.from(txBytes, "hex"), mode);
      }

      if (result.mode === "sync" || result.mode === "async") {
        if (result.code !== 0) {
          throw new Error(result.log);
        }
      } else if (result.mode === "commit") {
        if (result.checkTx.code !== undefined && result.checkTx.code !== 0) {
          throw new Error(result.checkTx.log);
        }
        if (
          result.deliverTx.code !== undefined &&
          result.deliverTx.code !== 0
        ) {
          throw new Error(result.deliverTx.log);
        }
      }

      new Notification("Tx succeeds");
    } catch (e) {
      console.log(e);
      new Notification("Tx failed", {
        body: e.message
      });
    }
  }
}
