import { delay, inject, singleton } from "tsyringe";

import Axios from "axios";
import { ChainsService } from "../chains";
import { PermissionService } from "../permission";
import { TendermintTxTracer } from "@keplr-wallet/cosmos/build/tx-tracer";

import { Buffer } from "buffer/";

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

@singleton()
export class BackgroundTxService {
  constructor(
    @inject(delay(() => ChainsService))
    protected readonly chainsService: ChainsService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService
  ) {}

  async sendTx(
    chainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block"
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    const restInstance = Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });

    browser.notifications.create({
      type: "basic",
      iconUrl: browser.runtime.getURL("assets/temp-icon.svg"),
      title: "Tx is pending...",
      message: "Wait a second",
    });

    const params = {
      tx,
      mode,
    };

    try {
      const result = await restInstance.post("/txs", params);
      if (result.data.code != null && result.data.code !== 0) {
        throw new Error(result.data["raw_log"]);
      }

      const txHash = Buffer.from(result.data.txhash, "hex");

      const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer.traceTx(txHash).then((tx) => {
        txTracer.close();
        BackgroundTxService.processTxResultNotification(tx);
      });

      return txHash;
    } catch (e) {
      console.log(e);
      BackgroundTxService.processTxErrorNotification(e);
      throw e;
    }
  }

  private static processTxResultNotification(result: any): void {
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
        message: "Congratulations!",
      });
    } catch (e) {
      BackgroundTxService.processTxErrorNotification(e);
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
      message,
    });
  }
}
