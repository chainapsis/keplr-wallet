import { TxEventMap, WsReadyState } from "./types";

import { Buffer } from "buffer/";

type Listeners = {
  [K in keyof TxEventMap]?: TxEventMap[K][];
};

export class TendermintTxTracer {
  protected ws: WebSocket;

  protected newBlockSubscribes: {
    handler: (block: any) => void;
  }[] = [];
  // Key is "id" for jsonrpc
  protected txSubscribes: Map<
    number,
    {
      hash: Uint8Array;
      resolver: (data?: unknown) => void;
      rejector: (e: Error) => void;
    }
  > = new Map();

  // Key is "id" for jsonrpc
  protected pendingQueries: Map<
    number,
    {
      method: string;
      params: unknown[];
      resolver: (data?: unknown) => void;
      rejector: (e: Error) => void;
    }
  > = new Map();

  protected listeners: Listeners = {};

  constructor(
    protected readonly url: string,
    protected readonly wsEndpoint: string,
    protected readonly options: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    } = {}
  ) {
    this.ws = this.options.wsObject
      ? new this.options.wsObject(this.getWsEndpoint())
      : new WebSocket(this.getWsEndpoint());
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
  }

  protected getWsEndpoint(): string {
    let url = this.url;
    if (url.startsWith("http")) {
      url = url.replace("http", "ws");
    }
    if (!url.endsWith(this.wsEndpoint)) {
      const wsEndpoint = this.wsEndpoint.startsWith("/")
        ? this.wsEndpoint
        : "/" + this.wsEndpoint;

      url = url.endsWith("/") ? url + wsEndpoint.slice(1) : url + wsEndpoint;
    }

    return url;
  }

  close() {
    this.ws.close();
  }

  get readyState(): WsReadyState {
    switch (this.ws.readyState) {
      case 0:
        return WsReadyState.CONNECTING;
      case 1:
        return WsReadyState.OPEN;
      case 2:
        return WsReadyState.CLOSING;
      case 3:
        return WsReadyState.CLOSED;
      default:
        return WsReadyState.NONE;
    }
  }

  addEventListener<T extends keyof TxEventMap>(
    type: T,
    listener: TxEventMap[T]
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.listeners[type]!.push(listener);
  }

  protected readonly onOpen = (e: Event) => {
    if (this.newBlockSubscribes.length > 0) {
      this.sendSubscribeBlockRpc();
    }

    for (const [id, tx] of this.txSubscribes) {
      this.sendSubscribeTxRpc(id, tx.hash);
    }

    for (const [id, query] of this.pendingQueries) {
      this.sendQueryRpc(id, query.method, query.params);
    }

    for (const listener of this.listeners.open ?? []) {
      listener(e);
    }
  };

  protected readonly onMessage = (e: MessageEvent) => {
    for (const listener of this.listeners.message ?? []) {
      listener(e);
    }

    if (e.data) {
      try {
        const obj = JSON.parse(e.data);

        if (obj?.id) {
          if (this.pendingQueries.has(obj.id)) {
            if (obj.error) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              this.pendingQueries
                .get(obj.id)!
                .rejector(new Error(obj.error.data || obj.error.message));
            } else {
              // XXX: I'm not sure why this happens, but somtimes the form of tx id delivered under the "tx_result" field.
              if (obj.result?.tx_result) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.pendingQueries.get(obj.id)!.resolver(obj.result.tx_result);
              } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.pendingQueries.get(obj.id)!.resolver(obj.result);
              }
            }

            this.pendingQueries.delete(obj.id);
          }
        }

        if (obj?.result?.data?.type === "tendermint/event/NewBlock") {
          for (const handler of this.newBlockSubscribes) {
            handler.handler(obj.result.data.value);
          }
        }

        if (obj?.result?.data?.type === "tendermint/event/Tx") {
          if (obj?.id) {
            if (this.txSubscribes.has(obj.id)) {
              if (obj.error) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.txSubscribes
                  .get(obj.id)!
                  .rejector(new Error(obj.error.data || obj.error.message));
              } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.txSubscribes
                  .get(obj.id)!
                  .resolver(obj.result.data.value.TxResult.result);
              }

              this.txSubscribes.delete(obj.id);
            }
          }
        }
      } catch (e) {
        console.log(
          `Tendermint websocket jsonrpc response is not JSON: ${
            e.message || e.toString()
          }`
        );
      }
    }
  };

  protected readonly onClose = (e: CloseEvent) => {
    for (const listener of this.listeners.close ?? []) {
      listener(e);
    }
  };

  subscribeBlock(handler: (block: any) => void) {
    this.newBlockSubscribes.push({
      handler,
    });

    if (this.newBlockSubscribes.length === 1) {
      this.sendSubscribeBlockRpc();
    }
  }

  protected sendSubscribeBlockRpc(): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: ["tm.event='NewBlock'"],
          id: 1,
        })
      );
    }
  }

  // Query the tx and subscribe the tx.
  traceTx(hash: Uint8Array): Promise<any> {
    return new Promise<any>((resolve) => {
      // At first, try to query the tx at the same time of subscribing the tx.
      // But, the querying's error will be ignored.
      this.queryTx(hash)
        .then(resolve)
        .catch(() => {
          // noop
        });

      this.subscribeTx(hash).then(resolve);
    });
  }

  subscribeTx(hash: Uint8Array): Promise<any> {
    const id = this.createRandomId();

    return new Promise<unknown>((resolve, reject) => {
      this.txSubscribes.set(id, {
        hash,
        resolver: resolve,
        rejector: reject,
      });

      this.sendSubscribeTxRpc(id, hash);
    });
  }

  protected sendSubscribeTxRpc(id: number, hash: Uint8Array): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: [
            `tm.event='Tx' AND tx.hash='${Buffer.from(hash)
              .toString("hex")
              .toUpperCase()}'`,
          ],
          id,
        })
      );
    }
  }

  queryTx(hash: Uint8Array): Promise<any> {
    return this.query("tx", [Buffer.from(hash).toString("base64"), false]);
  }

  protected query(method: string, params: unknown[]): Promise<any> {
    const id = this.createRandomId();

    return new Promise<unknown>((resolve, reject) => {
      this.pendingQueries.set(id, {
        method,
        params,
        resolver: resolve,
        rejector: reject,
      });

      this.sendQueryRpc(id, method, params);
    });
  }

  protected sendQueryRpc(id: number, method: string, params: unknown[]) {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id,
        })
      );
    }
  }

  protected createRandomId(): number {
    return parseInt(
      Array.from({ length: 6 })
        .map(() => Math.floor(Math.random() * 100))
        .join("")
    );
  }
}
