import { ObservableChainQuery } from "../chain-query";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { autorun, computed, flow, makeObservable, observable } from "mobx";
import { Keplr } from "@keplr-wallet/types";
import Axios, { CancelToken } from "axios";
import { QueryResponse } from "../../common";

import { Buffer } from "buffer/";

export class ObservableSecretContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  @observable.ref
  protected keplr?: Keplr = undefined;

  protected nonce?: Uint8Array;

  @observable
  protected _isIniting: boolean = false;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected obj: object,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    // Don't need to set the url initially because it can't request without encyption.
    super(kvStore, chainId, chainGetter, ``);
    makeObservable(this);

    // Try to get the keplr API.
    this.initKeplr();

    const disposer = autorun(() => {
      // If the keplr API is ready and the contract code hash is fetched, try to init.
      if (this.keplr && this.contractCodeHash) {
        this.init();
        disposer();
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected setObj(obj: object) {
    this.obj = obj;
    this.init();
  }

  get isFetching(): boolean {
    return (
      this.querySecretContractCodeHash.getQueryContract(this.contractAddress)
        .isFetching ||
      this.keplr == null ||
      this._isIniting ||
      super.isFetching
    );
  }

  protected canFetch(): boolean {
    if (
      !this.querySecretContractCodeHash.getQueryContract(this.contractAddress)
        .response
    ) {
      return false;
    }

    return this.contractAddress.length !== 0 && this.nonce != null;
  }

  @flow
  protected *initKeplr() {
    this.keplr = yield* toGenerator(this.apiGetter());
  }

  @flow
  protected *init() {
    this._isIniting = true;

    if (this.keplr && this.contractCodeHash) {
      const enigmaUtils = this.keplr.getEnigmaUtils(this.chainId);
      const encrypted = yield* toGenerator(
        enigmaUtils.encrypt(this.contractCodeHash, this.obj)
      );
      this.nonce = encrypted.slice(0, 32);

      const encoded = Buffer.from(
        Buffer.from(encrypted).toString("base64")
      ).toString("hex");

      this.setUrl(
        `/wasm/contract/${this.contractAddress}/query/${encoded}?encoding=hex`
      );
    }

    this._isIniting = false;
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<T>> {
    let response: QueryResponse<T>;
    try {
      response = await super.fetchResponse(cancelToken);
    } catch (e) {
      if (!Axios.isCancel(e) && e.response?.data?.error) {
        const encryptedError = e.response.data.error;

        const errorMessageRgx = /query contract failed: encrypted: (.+)/g;

        const rgxMatches = errorMessageRgx.exec(encryptedError);
        if (rgxMatches != null && rgxMatches.length === 2) {
          const errorCipherB64 = rgxMatches[1];
          const errorCipherBz = Buffer.from(errorCipherB64, "base64");

          if (this.keplr && this.nonce) {
            const decrypted = await this.keplr
              .getEnigmaUtils(this.chainId)
              .decrypt(errorCipherBz, this.nonce);

            const errorStr = Buffer.from(decrypted).toString();

            // If error is from secret wasm chain itself, decrypt the error message and throw it.
            throw new Error(errorStr);
          }
        }
      }
      throw e;
    }

    const encResult = (response.data as unknown) as
      | {
          height: string;
          result: {
            smart: string;
          };
        }
      | undefined;

    if (!this.keplr) {
      throw new Error("Keplr API not initialized");
    }

    if (!this.nonce) {
      throw new Error("Nonce is unknown");
    }

    if (!encResult) {
      throw new Error("Failed to get the response from the contract");
    }

    const decrypted = await this.keplr
      .getEnigmaUtils(this.chainId)
      .decrypt(Buffer.from(encResult.result.smart, "base64"), this.nonce);

    const message = Buffer.from(
      Buffer.from(decrypted).toString(),
      "base64"
    ).toString();

    const obj = JSON.parse(message);
    return {
      data: obj as T,
      status: response.status,
      staled: false,
      timestamp: Date.now(),
    };
  }

  // Actually, the url of fetching the secret20 balance will be changed every time.
  // So, we should save it with deterministic key.
  protected getCacheKey(): string {
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }${this.instance.getUri({
      url: `/wasm/contract/${this.contractAddress}/query/${JSON.stringify(
        this.obj
      )}?encoding=json`,
    })}`;
  }

  @computed
  get contractCodeHash(): string | undefined {
    const queryCodeHash = this.querySecretContractCodeHash.getQueryContract(
      this.contractAddress
    );

    if (!queryCodeHash.response) {
      return undefined;
    }

    // Code hash is persistent, so it is safe not to consider that the response is from cache or network.
    // TODO: Handle the error case.
    return queryCodeHash.response.data.result;
  }
}
