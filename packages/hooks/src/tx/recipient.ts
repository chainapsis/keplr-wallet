import { IRecipientConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import {
  EmptyAddressError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  ENSNotSupportedError,
  InvalidBech32Error,
} from "./errors";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useState } from "react";
import { ObservableEnsFetcher } from "@keplr-wallet/ens";

export class RecipientConfig extends TxChainSetter implements IRecipientConfig {
  @observable
  protected _rawRecipient: string = "";

  @observable
  protected _ensEndpoint: string | undefined = undefined;

  @observable
  protected _bech32Prefix: string | undefined = undefined;

  @observable.shallow
  protected ensFetcherMap: Map<string, ObservableEnsFetcher> = new Map();

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @computed
  get bech32Prefix(): string {
    if (!this._bech32Prefix) {
      return this.chainInfo.bech32Config.bech32PrefixAccAddr;
    }

    return this._bech32Prefix;
  }

  @action
  setBech32Prefix(prefix: string) {
    this._bech32Prefix = prefix;
  }

  get recipient(): string {
    if (ObservableEnsFetcher.isValidENS(this.rawRecipient)) {
      const ensFetcher = this.getENSFetcher(this.rawRecipient);
      if (ensFetcher) {
        if (ensFetcher.isFetching) {
          return "";
        }

        if (
          !ensFetcher.address ||
          ensFetcher.error != null ||
          ensFetcher.address.length !== 20
        ) {
          return "";
        }

        return new Bech32Address(ensFetcher.address).toBech32(
          this.bech32Prefix
        );
      } else {
        // Can't try to fetch the ENS.
        return "";
      }
    }

    return this._rawRecipient;
  }

  protected getENSFetcher(name: string): ObservableEnsFetcher | undefined {
    if (!this._ensEndpoint || this.chainInfo.coinType == null) {
      return;
    }

    if (!this.ensFetcherMap.has(this._ensEndpoint)) {
      runInAction(() => {
        this.ensFetcherMap.set(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this._ensEndpoint!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          new ObservableEnsFetcher(this._ensEndpoint!)
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fetcher = this.ensFetcherMap.get(this._ensEndpoint)!;
    fetcher.setNameAndCoinType(name, this.chainInfo.coinType);
    return fetcher;
  }

  @action
  setENSEndpoint(endpoint: string | undefined) {
    this._ensEndpoint = endpoint;
  }

  getError(): Error | undefined {
    if (!this.rawRecipient) {
      return new EmptyAddressError("Address is empty");
    }

    if (ObservableEnsFetcher.isValidENS(this.rawRecipient)) {
      const ensFetcher = this.getENSFetcher(this.rawRecipient);
      if (!ensFetcher) {
        return new ENSNotSupportedError("ENS not supported for this chain");
      }

      if (ensFetcher.isFetching) {
        return new ENSIsFetchingError("ENS is fetching");
      }

      if (
        !ensFetcher.address ||
        ensFetcher.error != null ||
        ensFetcher.address.length !== 20
      ) {
        return new ENSFailedToFetchError(
          "Failed to fetch the address from ENS"
        );
      }

      return;
    }

    try {
      Bech32Address.validate(this.recipient, this.bech32Prefix);
    } catch (e) {
      return new InvalidBech32Error(
        `Invalid bech32: ${e.message || e.toString()}`
      );
    }
    return;
  }

  get rawRecipient(): string {
    return this._rawRecipient;
  }

  @action
  setRawRecipient(recipient: string): void {
    this._rawRecipient = recipient;
  }
}

export const useRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  ensEndpoint?: string
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);
  config.setENSEndpoint(ensEndpoint);

  return config;
};
