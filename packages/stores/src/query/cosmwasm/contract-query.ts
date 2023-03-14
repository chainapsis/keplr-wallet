import { ObservableChainQuery } from "../chain-query";
import { ChainGetter } from "../../chain";
import { QuerySharedContext } from "../../common";

import { Buffer } from "buffer/";
import { autorun } from "mobx";

export class ObservableCosmwasmContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  protected disposer?: () => void;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected obj: object
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      ObservableCosmwasmContractChainQuery.getUrlFromObj(contractAddress, obj)
    );
  }

  protected override onStart(): void {
    super.onStart();

    this.disposer = autorun(() => {
      const chainInfo = this.chainGetter.getChain(this.chainId);
      if (chainInfo.features && chainInfo.features.includes("wasmd_0.24+")) {
        if (this.url.startsWith("/wasm/v1/")) {
          this.setUrl(`/cosmwasm${this.url}`);
        }
      } else {
        if (this.url.startsWith("/cosmwasm/")) {
          this.setUrl(`${this.url.replace("/cosmwasm", "")}`);
        }
      }
    });
  }

  protected override onStop() {
    if (this.disposer) {
      this.disposer();
      this.disposer = undefined;
    }
    super.onStop();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected static getUrlFromObj(contractAddress: string, obj: object): string {
    const msg = JSON.stringify(obj);
    const query = Buffer.from(msg).toString("base64");

    return `/wasm/v1/contract/${contractAddress}/smart/${query}`;
  }

  protected override canFetch(): boolean {
    return this.contractAddress.length !== 0;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const { data, headers } = await super.fetchResponse(abortController);

    const wasmResult = data as unknown as
      | {
          data: any;
        }
      | undefined;

    if (!wasmResult) {
      throw new Error("Failed to get the response from the contract");
    }

    return {
      headers,
      data: wasmResult.data as T,
    };
  }
}
