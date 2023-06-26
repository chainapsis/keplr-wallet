import { ObservableChainQuery } from "../chain-query";
import { toGenerator } from "@keplr-wallet/common";
import { ChainGetter } from "../../chain";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { computed, flow, makeObservable, observable } from "mobx";
import { Keplr } from "@keplr-wallet/types";
import { QuerySharedContext } from "../../common";

import { Buffer } from "buffer/";
import { makeURL } from "@keplr-wallet/simple-fetch";

export class ObservableSecretContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  @observable.ref
  protected keplr?: Keplr = undefined;

  protected nonce?: Uint8Array;

  @observable
  protected _isIniting: boolean = false;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected obj: object,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    // Don't need to set the url initially because it can't request without encyption.
    super(sharedContext, chainId, chainGetter, ``);
    makeObservable(this);
  }

  protected override async onStart() {
    super.onStart();

    if (!this.keplr) {
      await this.initKeplr();
    }

    if (!this.keplr) {
      throw new Error("Failed to get keplr");
    }

    await this.querySecretContractCodeHash
      .getQueryContract(this.contractAddress)
      .waitResponse();

    await this.init();
  }

  override get isFetching(): boolean {
    return (
      this.querySecretContractCodeHash.getQueryContract(this.contractAddress)
        .isFetching ||
      this.keplr == null ||
      this._isIniting ||
      super.isFetching
    );
  }

  protected override canFetch(): boolean {
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

      const encoded = Buffer.from(encrypted).toString("base64");
      this.setUrl(this.getSecretWasmUrl(this.contractAddress, encoded));
    }

    this._isIniting = false;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    let data: T;
    let headers: any;
    try {
      const fetched = await super.fetchResponse(abortController);
      data = fetched.data;
      headers = fetched.headers;
    } catch (e) {
      if (e.response?.data?.message) {
        const encryptedError = e.response.data.message;

        const errorMessageRgx =
          /encrypted: (.+?): (?:instantiate|execute|query|reply to) contract failed/g;

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

    const encResult = data as unknown as
      | {
          data: string;
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
      .decrypt(Buffer.from(encResult.data, "base64"), this.nonce);

    const message = Buffer.from(
      Buffer.from(decrypted).toString(),
      "base64"
    ).toString();

    const obj = JSON.parse(message);
    return {
      headers,
      data: obj as T,
    };
  }

  protected getSecretWasmUrl(contractAddress: string, msg: string): string {
    const queryParam = new URLSearchParams({ query: msg });
    return `/compute/v1beta1/query/${contractAddress}?${queryParam.toString()}`;
  }

  // Actually, the url of fetching the secret20 balance will be changed every time.
  // So, we should save it with deterministic key.
  protected override getCacheKey(): string {
    return makeURL(
      this.baseURL,
      this.getSecretWasmUrl(this.contractAddress, JSON.stringify(this.obj))
    );
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
    return queryCodeHash.response.data.code_hash;
  }
}
