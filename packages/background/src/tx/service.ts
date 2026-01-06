import { ChainsService } from "../chains";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { Notification } from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Buffer } from "buffer/";
import { retry } from "@keplr-wallet/common";
import { GetTransactionReceiptResponse, RpcProvider } from "starknet";

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

export class BackgroundTxService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly notification: Notification
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async sendTx(
    chainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    options: {
      silent?: boolean;
      onFulfill?: (tx: any) => void;
    }
  ): Promise<Uint8Array> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    if (!options.silent) {
      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx is pending...",
        message: "Wait a second",
      });
    }

    const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

    const params = isProtoTx
      ? {
          tx_bytes: Buffer.from(tx as any).toString("base64"),
          mode: (() => {
            switch (mode) {
              case "async":
                return "BROADCAST_MODE_ASYNC";
              case "block":
                return "BROADCAST_MODE_BLOCK";
              case "sync":
                return "BROADCAST_MODE_SYNC";
              default:
                return "BROADCAST_MODE_UNSPECIFIED";
            }
          })(),
        }
      : {
          tx,
          mode: mode,
        };

    try {
      const result = await simpleFetch<any>(
        chainInfo.rest,
        isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      const txResponse = isProtoTx ? result.data["tx_response"] : result.data;

      if (txResponse.code != null && txResponse.code !== 0) {
        throw new Error(txResponse["raw_log"]);
      }

      const txHash = Buffer.from(txResponse.txhash, "hex");

      // 이 기능은 tx commit일때 notification을 띄울 뿐이다.
      // 실제 로직 처리와는 관계가 없어야하기 때문에 여기서 await을 하면 안된다!!
      retry(
        () => {
          return new Promise<void>((resolve, reject) => {
            const txTracer = new TendermintTxTracer(
              chainInfo.rpc,
              "/websocket"
            );
            txTracer.addEventListener("close", () => {
              // reject if ws closed before fulfilled
              // 하지만 로직상 fulfill 되기 전에 ws가 닫히는게 되기 때문에
              // delay를 좀 준다.
              // trace 이후 로직은 동기적인 로직밖에 없기 때문에 문제될 게 없다.
              // 문제될게 없다.
              setTimeout(() => {
                reject();
              }, 500);
            });
            txTracer.addEventListener("error", () => {
              reject();
            });
            txTracer.traceTx(txHash).then((tx) => {
              txTracer.close();

              if (options.onFulfill) {
                if (!tx.hash) {
                  tx.hash = txHash;
                }
                options.onFulfill(tx);
              }

              if (!options.silent) {
                BackgroundTxService.processTxResultNotification(
                  this.notification,
                  tx
                );
              }

              resolve();
            });
          });
        },
        {
          maxRetries: 10,
          waitMsAfterError: 10 * 1000, // 10sec
          maxWaitMsAfterError: 5 * 60 * 1000, // 5min
        }
      );

      return txHash;
    } catch (e) {
      console.log(e);
      if (!options.silent) {
        BackgroundTxService.processTxErrorNotification(this.notification, e);
      }
      throw e;
    }
  }

  private static processTxResultNotification(
    notification: Notification,
    result: any
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

      notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx succeeds",
        // TODO: Let users know the tx id?
        message: "Congratulations!",
      });
    } catch (e) {
      BackgroundTxService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(
    notification: Notification,
    e: Error
  ): void {
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

    notification.create({
      iconRelativeUrl: "assets/logo-256.png",
      title: "Tx failed",
      message,
    });
  }

  async waitStarknetTransaction(
    chainId: string,
    txHash: string
  ): Promise<GetTransactionReceiptResponse> {
    const modularChainInfo = this.chainsService.getModularChainInfo(chainId);
    if (!modularChainInfo) {
      throw new Error("Invalid chain id");
    }
    if (!("starknet" in modularChainInfo)) {
      throw new Error("Chain is not for starknet");
    }
    const starknet = modularChainInfo.starknet;
    const provider = new RpcProvider({
      nodeUrl: starknet.rpc,
      specVersion: "0.9.0",
    });

    this.notification.create({
      iconRelativeUrl: "assets/logo-256.png",
      title: "Tx is pending...",
      message: "Wait a second",
    });

    try {
      const res = await provider.waitForTransaction(txHash, {
        retryInterval: 1000,
      });

      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx succeeds",
        message: "Congratulations!",
      });
      return res;
    } catch (e) {
      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx failed",
        message: "",
      });

      throw e;
    }
  }

  async pushBitcoinTransaction(
    chainId: string,
    txHex: string
  ): Promise<string> {
    const modularChainInfo = this.chainsService.getModularChainInfo(chainId);
    if (!modularChainInfo) {
      throw new Error("Invalid chain id");
    }

    if (!("bitcoin" in modularChainInfo)) {
      throw new Error("Chain is not for bitcoin");
    }

    const indexerUrl = modularChainInfo.bitcoin.rest;

    try {
      const res = await simpleFetch<string>(`${indexerUrl}/tx`, {
        method: "POST",
        body: txHex,
        headers: {
          "Content-Type": "text/plain",
        },
      });

      if (res.status !== 200) {
        const message = res.data;
        throw new Error(message);
      }

      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx succeeds",
        message: "Congratulations!",
      });

      return res.data;
    } catch (e) {
      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx failed",
        message: "",
      });

      throw e;
    }
  }
}
