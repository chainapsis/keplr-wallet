import { ChainsService } from "../chains";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Notification } from "../tx/types";

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
      onFulfill?: (tx: any) => void;
    }
  ): Promise<string> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    if (!options.silent) {
      this.notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx is pending...",
        message: "Wait a second",
      });
    }

    try {
      const response = await simpleFetch<{
        id: number;
        jsonrpc: string;
        result: string;
      }>(chainInfo.rpc, "", {
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

      if (!options.silent) {
        BackgroundTxEthereumService.processTxResultNotification(
          this.notification,
          rawTx
        );
      }

      const txHash = response.data.result;

      return txHash;
    } catch (e) {
      console.log(e);
      if (!options.silent) {
        BackgroundTxEthereumService.processTxErrorNotification(
          this.notification,
          e
        );
      }
      throw e;
    }
  }

  private static processTxResultNotification(
    notification: Notification,
    rawTx: string
  ): void {
    try {
      notification.create({
        iconRelativeUrl: "assets/logo-256.png",
        title: "Tx succeeds",
        // TODO: Let users know the tx id?
        message: "Congratulations!" + rawTx,
      });
    } catch (e) {
      BackgroundTxEthereumService.processTxErrorNotification(notification, e);
    }
  }

  private static processTxErrorNotification(
    notification: Notification,
    e: Error
  ): void {
    console.log(e);
    const message = e.message;

    notification.create({
      iconRelativeUrl: "assets/logo-256.png",
      title: "Tx failed",
      message,
    });
  }
}
