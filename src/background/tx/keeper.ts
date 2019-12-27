import { KeyRingKeeper } from "../keyring/keeper";
import Axios, { AxiosInstance } from "axios";

import { Context, IContext } from "@everett-protocol/cosmosjs/core/context";
import { TendermintRPC } from "@everett-protocol/cosmosjs/rpc/tendermint";
import {
  ResultBroadcastTx,
  ResultBroadcastTxCommit
} from "@everett-protocol/cosmosjs/rpc/tx";

const Buffer = require("buffer/").Buffer;

interface CosmosSdkError {
  codespace: string;
  code: number;
  message: string;
}

interface ABCIMessageLog {
  msg_index: number;
  success: boolean;
  log: string;
  // Events StringEvents
}

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
      let message = e.message;

      // Tendermint rpc error.
      const regResult = /code:\s*(-?\d+),\s*message:\s*(.+),\sdata:\s(.+)/g.exec(
        e.message
      );
      if (regResult && regResult.length === 4) {
        // If error is from tendermint
        message = regResult[3];
      }

      try {
        // Cosmos-sdk error in ante handler
        const sdkErr: CosmosSdkError = JSON.parse(e.message);
        if (sdkErr?.message) {
          message = sdkErr.message;
        }
      } catch {
        // noop
      }

      try {
        // Cosmos-sdk error in processing message
        const abciMessageLogs: ABCIMessageLog[] = JSON.parse(e.message);
        if (abciMessageLogs && abciMessageLogs.length > 0) {
          for (const abciMessageLog of abciMessageLogs) {
            if (!abciMessageLog.success) {
              const sdkErr: CosmosSdkError = JSON.parse(abciMessageLog.log);
              if (sdkErr?.message) {
                message = sdkErr.message;
                break;
              }
            }
          }
        }
      } catch {
        // noop
      }

      new Notification("Tx failed", {
        body: message
      });
    }
  }

  checkAccessOrigin(chainId: string, origin: string) {
    this.keyRingKeeper.checkAccessOrigin(chainId, origin);
  }
}
