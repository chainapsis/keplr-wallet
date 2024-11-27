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
import { CallData, constants } from "starknet";

interface StarknetIDFetchData {
  isFetching: boolean;
  starknetHexAddress?: string;
  error?: Error;
}

const networkToNamingContractAddress = {
  [constants.NetworkName.SN_MAIN]:
    "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678",
  [constants.NetworkName.SN_SEPOLIA]:
    "0x0707f09bc576bd7cfee59694846291047e965f4184fe13dac62c56759b3b6fa7",
};

const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const basicSizePlusOne = BigInt(basicAlphabet.length + 1);
const bigAlphabet = "这来";
const basicAlphabetSize = BigInt(basicAlphabet.length);
const bigAlphabetSize = BigInt(bigAlphabet.length);

function encodeDomain(domain: string | undefined | null): bigint[] {
  if (!domain) return [BigInt(0)];

  const encoded = [];
  for (const subdomain of domain.replace(".stark", "").split("."))
    encoded.push(encode(subdomain));
  return encoded;
}

function extractStars(str: string): [string, number] {
  let k = 0;
  while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
    str = str.substring(0, str.length - 1);
    k += 1;
  }
  return [str, k];
}

function encode(decoded: string | undefined): bigint {
  let encoded = BigInt(0);
  let multiplier = BigInt(1);

  if (!decoded) {
    return encoded;
  }

  if (decoded.endsWith(bigAlphabet[0] + basicAlphabet[1])) {
    const [str, k] = extractStars(decoded.substring(0, decoded.length - 2));
    decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(2 * (k + 1));
  } else {
    const [str, k] = extractStars(decoded);
    if (k)
      decoded =
        str + bigAlphabet[bigAlphabet.length - 1].repeat(1 + 2 * (k - 1));
  }

  for (let i = 0; i < decoded.length; i += 1) {
    const char = decoded[i];
    const index = basicAlphabet.indexOf(char);
    const bnIndex = BigInt(basicAlphabet.indexOf(char));

    if (index !== -1) {
      // add encoded + multiplier * index
      if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
        encoded += multiplier * basicAlphabetSize;
        multiplier *= basicSizePlusOne;
        // add 0
        multiplier *= basicSizePlusOne;
      } else {
        encoded += multiplier * bnIndex;
        multiplier *= basicSizePlusOne;
      }
    } else if (bigAlphabet.indexOf(char) !== -1) {
      // add encoded + multiplier * (basicAlphabetSize)
      encoded += multiplier * basicAlphabetSize;
      multiplier *= basicSizePlusOne;
      // add encoded + multiplier * index
      const newid =
        (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
      encoded += multiplier * BigInt(newid);
      multiplier *= bigAlphabetSize;
    }
  }

  return encoded;
}

function isStarknetHexAddress(address: string): boolean {
  if (!address.startsWith("0x")) {
    return false;
  }

  const hex = address.replace("0x", "");
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) {
    return false;
  }
  if (hex.toLowerCase() !== buf.toString("hex").toLowerCase()) {
    return false;
  }

  return true;
}

export class RecipientConfig
  extends TxChainSetter
  implements IRecipientConfig, IRecipientConfigWithStarknetID
{
  @observable
  protected _value: string = "";

  // Deep equal check is required to avoid infinite re-render.
  @observable.struct
  protected _starknetID:
    | {
        networkName: string;
        namingContractAddress: string;
      }
    | undefined = undefined;

  // Key is {chain identifier}/{starknet username}
  @observable.shallow
  protected _starknetIDFetchDataMap = new Map<string, StarknetIDFetchData>();

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setStarknetID(chainId: string) {
    const split = chainId.split(":"); // `starknet:networkName`
    if (split.length < 2) {
      return;
    }

    // Only support the mainnet for now.
    const networkName = split[1] as constants.NetworkName;
    if (!networkName) {
      return;
    }

    const namingContractAddress = networkToNamingContractAddress[networkName];
    if (!namingContractAddress) {
      return;
    }

    this._starknetID = {
      networkName,
      namingContractAddress,
    };
  }

  protected getStarknetIDFetchData(username: string): StarknetIDFetchData {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not starknet chain`);
    }

    if (!this._starknetID) {
      throw new Error("Starknet ID is not set");
    }

    const key = `${this.chainId}/${username}`;

    if (!this._starknetIDFetchDataMap.has(key)) {
      runInAction(() => {
        this._starknetIDFetchDataMap.set(key, {
          isFetching: true,
        });
      });

      const domain = encodeDomain(username).map((v) => v.toString(10));

      simpleFetch<{
        jsonrpc: "2.0";
        result?: string[];
        id: string;
        error?: {
          code?: number;
          message?: string;
        };
      }>(
        "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/Dd-R0QOJGtrWsePbiXmZl2QSBX5nk3vD",
        "",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "starknet_call",
            params: [
              {
                contract_address: this._starknetID.namingContractAddress,
                calldata: CallData.toHex({ domain, hint: [] }),
                entry_point_selector:
                  "0x2e269d930f6d7ab92b15ce8ff9f5e63709391617e3465fff79ba6baf278ce60", // selector.getSelectorFromName("domain_to_address"),
              },
              "latest",
            ],
          }),
          signal: new AbortController().signal,
        }
      )
        .then((resp) => {
          if (resp.data.error && resp.data.error.message) {
            throw new StarknetIDIsFetchingError(resp.data.error.message);
          }

          const data = resp.data.result;
          if (!data) {
            throw new StarknetIDIsFetchingError("no address found");
          }

          const rawHexAddr = data[0];
          if (rawHexAddr === "0x0") {
            throw new StarknetIDIsFetchingError("no address found");
          }

          const addr = "0x" + rawHexAddr.replace("0x", "").padStart(64, "0");

          if (!isStarknetHexAddress(addr)) {
            throw new StarknetIDIsFetchingError("no address found");
          }

          runInAction(() => {
            this._starknetIDFetchDataMap.set(key, {
              isFetching: false,
              starknetHexAddress: addr,
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

  get isStarknetIDEnabled(): boolean {
    return !!this._starknetID;
  }

  @computed
  get isStarknetID(): boolean {
    if (this.isStarknetIDEnabled) {
      const parsed = this.value.trim().split(".");
      return parsed.length > 1 && parsed[parsed.length - 1] === "stark";
    }

    return false;
  }

  @computed
  get isStarknetIDFetching(): boolean {
    if (!this.isStarknetIDEnabled || !this.isStarknetID) {
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

    if (this.isStarknetIDEnabled && this.isStarknetID) {
      try {
        return (
          this.getStarknetIDFetchData(rawRecipient).starknetHexAddress || ""
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

    if (this.isStarknetIDEnabled && this.isStarknetID) {
      try {
        const fetched = this.getStarknetIDFetchData(rawRecipient);

        if (fetched.isFetching) {
          return {
            loadingState: "loading-block",
          };
        }

        if (!fetched.starknetHexAddress) {
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

    if (!isStarknetHexAddress(rawRecipient)) {
      return {
        error: new InvalidHexError("Invalid hex address for chain"),
      };
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
  config.setStarknetID(chainId);

  return config;
};
