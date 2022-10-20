import { ObservableChainQuery } from "../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { CancelToken } from "axios";
import { QueryResponse } from "../../common";

import { Buffer } from "buffer/";

export class ObservableCosmwasmContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected obj: object
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      ObservableCosmwasmContractChainQuery.getUrlFromObj(contractAddress, obj)
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected static getUrlFromObj(contractAddress: string, obj: object): string {
    const msg = JSON.stringify(obj);
    const query = Buffer.from(msg).toString("base64");

    return `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${query}`;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected setObj(obj: object) {
    this.obj = obj;

    this.setUrl(
      ObservableCosmwasmContractChainQuery.getUrlFromObj(
        this.contractAddress,
        this.obj
      )
    );
  }

  protected canFetch(): boolean {
    return this.contractAddress.length !== 0;
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<T>> {
    const response = await super.fetchResponse(cancelToken);

    const wasmResult = (response.data as unknown) as
      | {
          data: any;
        }
      | undefined;

    if (!wasmResult) {
      throw new Error("Failed to get the response from the contract");
    }

    return {
      data: wasmResult.data as T,
      status: response.status,
      staled: false,
      timestamp: Date.now(),
    };
  }
}
