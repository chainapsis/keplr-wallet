import Axios, { AxiosInstance } from "axios";

import { Context, IContext } from "@chainapsis/cosmosjs/core/context";
import { TendermintRPC } from "@chainapsis/cosmosjs/rpc/tendermint";
import {
  ResultBroadcastTx,
  ResultBroadcastTxCommit
} from "@chainapsis/cosmosjs/rpc/tx";
import { ChainsKeeper } from "../chains/keeper";
import { sendMessage } from "../../common/message/send";
import { POPUP_PORT } from "../../common/message/constant";
import { TxCommittedMsg } from "./foreground";

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
  constructor(private chainsKeeper: ChainsKeeper) {}

  async requestTx(
    chainId: string,
    txBytes: string,
    mode: "sync" | "async" | "commit",
    isRestAPI: boolean
  ) {
    const info = await this.chainsKeeper.getChainInfo(chainId);
    const rpcInstance = Axios.create({
      ...{
        baseURL: info.rpc
      },
      ...info.rpcConfig
    });
    const restInstance = Axios.create({
      ...{
        baseURL: info.rest
      },
      ...info.restConfig
    });

    // Do not await.
    BackgroundTxKeeper.sendTransaction(
      chainId,
      rpcInstance,
      restInstance,
      txBytes,
      mode,
      isRestAPI
    );

    return;
  }

  async requestTxWithResult(
    chainId: string,
    txBytes: string,
    mode: "sync" | "async" | "commit",
    isRestAPI: boolean
  ): Promise<ResultBroadcastTx | ResultBroadcastTxCommit> {
    const info = await this.chainsKeeper.getChainInfo(chainId);
    const rpcInstance = Axios.create({
      ...{
        baseURL: info.rpc
      },
      ...info.rpcConfig
    });
    const restInstance = Axios.create({
      ...{
        baseURL: info.rest
      },
      ...info.restConfig
    });

    return await BackgroundTxKeeper.sendTransaction(
      chainId,
      rpcInstance,
      restInstance,
      txBytes,
      mode,
      isRestAPI
    );
  }

  private static async sendTransaction(
    chainId: string,
    rpcInstance: AxiosInstance,
    restInstance: AxiosInstance,
    txBytes: string,
    mode: "sync" | "async" | "commit",
    isRestAPI: boolean
  ): Promise<ResultBroadcastTx | ResultBroadcastTxCommit> {
    const rpc = new TendermintRPC(
      new Context({
        rpcInstance
      } as IContext)
    );

    let result: ResultBroadcastTx | ResultBroadcastTxCommit | undefined;

    browser.notifications.create({
      type: "basic",
      iconUrl: browser.runtime.getURL("assets/temp-icon.svg"),
      title: "Tx is pending...",
      message: "Wait a second"
    });

    try {
      if (!isRestAPI) {
        if (mode === "commit") {
          result = await rpc.broadcastTxCommit(Buffer.from(txBytes, "hex"));
        } else {
          result = await rpc.broadcastTx(Buffer.from(txBytes, "hex"), mode);
        }
      } else {
        const json = JSON.parse(Buffer.from(txBytes, "hex").toString());
        const restResult = await restInstance.post<
          ResultBroadcastTx | ResultBroadcastTxCommit
        >("/txs", {
          tx: json,
          mode: mode === "commit" ? "block" : mode
        });

        if (restResult.status !== 200 && restResult.status !== 202) {
          throw new Error(restResult.statusText);
        }

        result = restResult.data;
      }

      BackgroundTxKeeper.processTxResultNotification(result);

      try {
        // Notify the tx is committed.
        sendMessage(POPUP_PORT, new TxCommittedMsg(chainId));
      } catch {
        // No matter if error is thrown.
      }
    } catch (e) {
      BackgroundTxKeeper.processTxErrorNotification(e);

      throw e;
    }

    return result;
  }

  private static processTxResultNotification(
    result: ResultBroadcastTx | ResultBroadcastTxCommit
  ): void {
    try {
      if (result.mode === "commit") {
        if (result.checkTx.code !== undefined && result.checkTx.code !== 0) {
          throw new Error(result.checkTx.log);
        }
        if (
          result.deliverTx.code !== undefined &&
          result.deliverTx.code !== 0
        ) {
          throw new Error(result.deliverTx.log);
        }
      } else {
        if (result.code != null && result.code !== 0) {
          // XXX: Hack of the support of the stargate.
          const log = result.log ?? (result as any)["raw_log"];
          throw new Error(log);
        }
      }

      browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("assets/temp-icon.svg"),
        title: "Tx succeeds",
        // TODO: Let users know the tx id?
        message: "Congratulations!"
      });
    } catch (e) {
      BackgroundTxKeeper.processTxErrorNotification(e);
    }
  }

  private static processTxErrorNotification(e: Error): void {
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

    browser.notifications.create({
      type: "basic",
      iconUrl: browser.runtime.getURL("assets/temp-icon.svg"),
      title: "Tx failed",
      message
    });
  }

  async checkAccessOrigin(
    extensionBaseURL: string,
    chainId: string,
    origin: string
  ) {
    await this.chainsKeeper.checkAccessOrigin(
      extensionBaseURL,
      chainId,
      origin
    );
  }
}
