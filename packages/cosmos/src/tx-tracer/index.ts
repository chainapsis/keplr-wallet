import { Buffer } from "buffer/";

type Listeners = {
  [K in keyof TxEventMap]?: TxEventMap[K][];
};

export enum WsReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  // WS is not initialized or the ready state of WS is unknown
  NONE,
}

export interface TxEventMap {
  close: (e: CloseEvent) => void;
  error: (e: Event) => void;
  message: (e: MessageEvent) => void;
  open: (e: Event) => void;
}

export class TendermintTxTracer {
  protected ws: WebSocket;

  protected newBlockSubscribes: {
    handler: (block: any) => void;
  }[] = [];
  // Key is "id" for jsonrpc
  protected txSubscribes: Map<
    number,
    {
      params: Record<string, string | number | boolean>;
      resolver: (data?: unknown) => void;
      rejector: (e: Error) => void;
    }
  > = new Map();

  // Key is "id" for jsonrpc
  protected pendingQueries: Map<
    number,
    {
      method: string;
      params: Record<string, string | number | boolean>;
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
    this.ws.onerror = this.onError;
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
      this.sendSubscribeTxRpc(id, tx.params);
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

  protected readonly onError = (e: Event) => {
    for (const listener of this.listeners.error ?? []) {
      listener(e);
    }
    this.close();
  };

  /**
   * SubscribeBlock receives the handler for the block.
   * The handelrs shares the subscription of block.
   * @param handler
   * @return unsubscriber
   */
  subscribeBlock(handler: (block: any) => void) {
    this.newBlockSubscribes.push({
      handler,
    });

    if (this.newBlockSubscribes.length === 1) {
      this.sendSubscribeBlockRpc();
    }

    return () => {
      this.newBlockSubscribes = this.newBlockSubscribes.filter(
        (s) => s.handler !== handler
      );
    };
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
  traceTx(
    query: Uint8Array | Record<string, string | number | boolean>
  ): Promise<any> {
    let resolved = false;
    return new Promise<any>((resolve) => {
      // At first, try to query the tx at the same time of subscribing the tx.
      // But, the querying's error will be ignored.
      this.queryTx(query)
        .then((result) => {
          if (query instanceof Uint8Array) {
            resolve(result);
            return;
          }

          if (result?.total_count !== "0") {
            resolve(result);
            return;
          }
        })
        .catch(() => {
          // noop
        });

      (async () => {
        // We don't know why yet. For some unknown reason, there is a problem where Tendermint does not give value through subscribe forever.
        // For now, as a simple solution, send tx_search periodically as well.
        while (true) {
          if (
            resolved ||
            this.readyState === WsReadyState.CLOSED ||
            this.readyState === WsReadyState.CLOSING
          ) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 10000));

          this.queryTx(query)
            .then((result) => {
              if (query instanceof Uint8Array) {
                resolve(result);
                return;
              }

              if (result?.total_count !== "0") {
                resolve(result);
                return;
              }
            })
            .catch(() => {
              // noop
            });
        }
      })();

      this.subscribeTx(query).then(resolve);
    }).then((tx) => {
      resolved = true;
      // Occasionally, even if the subscribe tx event occurs, the state through query is not changed yet.
      // Perhaps it is because the block has not been committed yet even though the result of deliverTx in tendermint is complete.
      // This method is usually used to reflect the state change through query when tx is completed.
      // The simplest solution is to just add a little delay.
      return new Promise((resolve) => {
        setTimeout(() => resolve(tx), 100);
      });
    });
  }

  subscribeTx(
    query: Uint8Array | Record<string, string | number | boolean>
  ): Promise<any> {
    if (query instanceof Uint8Array) {
      const id = this.createRandomId();

      const params = {
        query: `tm.event='Tx' AND tx.hash='${Buffer.from(query)
          .toString("hex")
          .toUpperCase()}'`,
      };

      return new Promise<unknown>((resolve, reject) => {
        this.txSubscribes.set(id, {
          params,
          resolver: resolve,
          rejector: reject,
        });

        this.sendSubscribeTxRpc(id, params);
      });
    } else {
      const id = this.createRandomId();

      const params = {
        query:
          `tm.event='Tx' AND ` +
          Object.keys(query)
            .map((key) => {
              return {
                key,
                value: query[key],
              };
            })
            .map((obj) => {
              return `${obj.key}=${
                typeof obj.value === "string" ? `'${obj.value}'` : obj.value
              }`;
            })
            .join(" AND "),
        page: "1",
        per_page: "1",
        order_by: "asc",
      };

      return new Promise<unknown>((resolve, reject) => {
        this.txSubscribes.set(id, {
          params,
          resolver: resolve,
          rejector: reject,
        });

        this.sendSubscribeTxRpc(id, params);
      });
    }
  }

  protected sendSubscribeTxRpc(
    id: number,
    params: Record<string, string | number | boolean>
  ): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: params,
          id,
        })
      );
    }
  }

  queryTx(
    query: Uint8Array | Record<string, string | number | boolean>
  ): Promise<any> {
    if (query instanceof Uint8Array) {
      return this.query("tx", {
        hash: Buffer.from(query).toString("base64"),
        prove: false,
      });
    } else {
      const params = {
        query: Object.keys(query)
          .map((key) => {
            return {
              key,
              value: query[key],
            };
          })
          .map((obj) => {
            return `${obj.key}=${
              typeof obj.value === "string" ? `'${obj.value}'` : obj.value
            }`;
          })
          .join(" AND "),
        page: "1",
        per_page: "1",
        order_by: "asc",
      };

      return this.query("tx_search", params);
    }
  }

  protected query(
    method: string,
    params: Record<string, string | number | boolean>
  ): Promise<any> {
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

  protected sendQueryRpc(
    id: number,
    method: string,
    params: Record<string, string | number | boolean>
  ) {
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
