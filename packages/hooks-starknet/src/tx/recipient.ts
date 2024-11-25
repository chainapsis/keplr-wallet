import {
  IRecipientConfig,
  IRecipientConfigWithStarknetID,
  UIProperties,
} from "./types";
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
  InvalidHexError,
  StarknetIDFailedToFetchError,
  StarknetIDIsFetchingError,
} from "./errors";
import { useState } from "react";
import { Buffer } from "buffer/";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

interface StarknetIDFetchData {
  isFetching: boolean;
  starknetHexaddress?: string;
  error?: Error;
}

export class RecipientConfig
  extends TxChainSetter
  implements IRecipientConfig, IRecipientConfigWithStarknetID
{
  @observable
  protected _value: string = "";

  // Key is {chain identifier}/{starknet username}
  @observable.shallow
  protected _starknetIDFetchDataMap = new Map<string, StarknetIDFetchData>();

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  protected getStarknetIDFetchData(username: string): StarknetIDFetchData {
    if (!this.chainGetter.hasModularChain(this.chainId)) {
      throw new Error(`Can't find chain: ${this.chainId}`);
    }

    const key = `${this.chainId}/${username}`;

    if (!this._starknetIDFetchDataMap.has(key)) {
      runInAction(() => {
        this._starknetIDFetchDataMap.set(key, {
          isFetching: true,
        });
      });

      simpleFetch<{
        addr: string;
        domain_expiry: number;
      }>("https://api.starknet.id", `domain_to_addr?domain=${username}`)
        .then((response) => {
          if (response.status !== 200) {
            throw new StarknetIDIsFetchingError("Failed to fetch the address");
          }

          const data = response.data;
          const addr = data.addr;
          if (!addr) {
            throw new StarknetIDIsFetchingError("no address found");
          }

          runInAction(() => {
            this._starknetIDFetchDataMap.set(key, {
              isFetching: false,
              starknetHexaddress: addr,
            });
          });
        })
        .catch((error) => {
          runInAction(() => {
            this._starknetIDFetchDataMap.set(key, {
              isFetching: false,
              error,
            });
          });
        });
    }

    return this._starknetIDFetchDataMap.get(key) ?? { isFetching: false };
  }

  @computed
  get isStarknetID(): boolean {
    const parsed = this.value.trim().split(".");
    return parsed.length > 1 && parsed[parsed.length - 1] === "stark";
  }

  @computed
  get isStarknetIDFetching(): boolean {
    if (!this.isStarknetID) {
      return false;
    }

    return this.getStarknetIDFetchData(this.value.trim()).isFetching;
  }

  get starknetExpectedDomain(): string {
    return "stark";
  }

  get recipient(): string {
    const rawRecipient = this.value.trim();

    const modularChainInfo = this.modularChainInfo;
    if (!("starknet" in modularChainInfo)) {
      throw new Error("Chain doesn't support the starknet");
    }

    if (this.isStarknetID) {
      try {
        return (
          this.getStarknetIDFetchData(rawRecipient).starknetHexaddress || ""
        );
      } catch {
        return "";
      }
    }

    return rawRecipient;
  }

  @computed
  get uiProperties(): UIProperties {
    const rawRecipient = this.value.trim();

    if (!rawRecipient) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    if (this.isStarknetID) {
      try {
        const fetched = this.getStarknetIDFetchData(rawRecipient);

        if (fetched.isFetching) {
          return {
            loadingState: "loading-block",
          };
        }

        if (!fetched.starknetHexaddress) {
          return {
            error: new StarknetIDFailedToFetchError(
              "Failed to fetch the address from Starknet ID"
            ),
            loadingState: fetched.isFetching ? "loading-block" : undefined,
          };
        }

        if (fetched.error) {
          return {
            error: new StarknetIDFailedToFetchError(
              "Failed to fetch the address from Starknet ID"
            ),
            loadingState: fetched.isFetching ? "loading-block" : undefined,
          };
        }

        return {};
      } catch (e) {
        return {
          error: e,
        };
      }
    }

    if (!rawRecipient.startsWith("0x")) {
      return {
        error: new InvalidHexError("Invalid hex address for chain"),
      };
    }

    {
      const hex = rawRecipient.replace("0x", "");
      const buf = Buffer.from(hex, "hex");
      if (buf.length !== 32) {
        return {
          error: new InvalidHexError("Invalid hex address for chain"),
        };
      }
      if (hex.toLowerCase() !== buf.toString("hex").toLowerCase()) {
        return {
          error: new InvalidHexError("Invalid hex address for chain"),
        };
      }
    }

    return {};
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string): void {
    this._value = value;
  }
}

export const useRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);

  return config;
};
