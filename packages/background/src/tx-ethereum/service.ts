import { ChainsService } from "../chains";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Notification } from "../tx/types";
import { KeyRingEthereumService } from "../keyring-ethereum";
import { EthTxReceipt, EthTxStatus } from "@keplr-wallet/types";

const TX_RECIEPT_POLLING_INTERVAL = 1000;

export class BackgroundTxEthereumService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly notification: Notification
  ) {}

  async init(): Promise<void> {
    // noop
  }

  async sendEthereumTx(
    chainId: string,
    rawTx: string,
    options: {
      silent?: boolean;
      onFulfill?: (txReceipt: EthTxReceipt) => void;
    }
  ): Promise<string> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const evmInfo = KeyRingEthereumService.evmInfo(chainInfo);

    if (!evmInfo) {
      throw new Error("Not EVM chain");
    }

    if (!options.silent) {
      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx is pending...",
        message: "Wait a second",
      });
    }

    try {
      const sendRawTransactionResponse = await simpleFetch<{
        result?: string;
        error?: Error;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      }>(evmInfo.rpc, "", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_sendRawTransaction",
          params: [rawTx],
          id: 1,
        }),
      });

      const txHash = sendRawTransactionResponse.data.result;
      if (!txHash) {
        throw (
          sendRawTransactionResponse.data.error ??
          new Error("No tx hash responed")
        );
      }

      const intervalId = setInterval(async () => {
        const txRecieptResponse = await simpleFetch<{
          result: EthTxReceipt | null;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          error?: Error;
        }>(evmInfo.rpc, {
          method: "POST",
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [txHash],
            id: 1,
          }),
        });

        if (txRecieptResponse.data.error) {
          console.error(txRecieptResponse.data.error);
          clearInterval(intervalId);
        }

        const txReceipt = txRecieptResponse.data.result;
        if (txReceipt) {
          clearInterval(intervalId);
          if (txReceipt.status === EthTxStatus.Success) {
            options.onFulfill?.(txReceipt);

            if (!options.silent) {
              BackgroundTxEthereumService.processTxResultNotification(
                this.notification
              );
            }
          } else {
            BackgroundTxEthereumService.processTxErrorNotification(
              this.notification,
              new Error("Tx failed on chain")
            );
          }
        }
      }, TX_RECIEPT_POLLING_INTERVAL);

      return txHash;
    } catch (e) {
      console.error(e);
      if (!options.silent) {
        BackgroundTxEthereumService.processTxErrorNotification(
          this.notification,
          e
        );
      }
      throw e;
    }
  }

  private static processTxResultNotification(notification: Notification): void {
    try {
      notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx succeeds",
        // TODO: Let users know the tx id?
        message: "Congratulations!",
      });
    } catch (e) {
      BackgroundTxEthereumService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(
    notification: Notification,
    e: Error
  ): void {
    const message = e.message;

    notification.create({
      iconRelativeUrl: "assets/logo-256.png",
      title: "Tx failed",
      message,
    });
  }
}
