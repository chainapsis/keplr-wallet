import { IRecipientConfig, IRecipientConfigWithICNS } from "./types";
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
  ICNSFailedToFetchError,
  ICNSIsFetchingError,
  InvalidBech32Error,
  InvalidHexError,
} from "./errors";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { useState } from "react";
import { isAddress } from "@ethersproject/address";
import { Buffer } from "buffer/";
import { validateICNSName } from "@keplr-wallet/common";

interface ICNSFetchData {
  isFetching: boolean;
  bech32Address?: string;
  error?: Error;
}

export class RecipientConfig
  extends TxChainSetter
  implements IRecipientConfig, IRecipientConfigWithICNS {
  @observable
  protected _rawRecipient: string = "";

  @observable
  protected _allowHexAddressOnEthermint: boolean | undefined = undefined;

  @observable
  protected _bech32Prefix: string | undefined = undefined;

  // Deep equal check is required to avoid infinite re-render.
  @observable.struct
  protected _icns:
    | {
        chainId: string;
        resolverContractAddress: string;
      }
    | undefined = undefined;

  // Key is {chain identifier of chain which resolver exists}/{resolver address}/{icns username}
  @observable.shallow
  protected _icnsFetchDataMap = new Map<string, ICNSFetchData>();

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

  // CONTRACT: Call this only if icns is set (chain id and resolverContractAddress)
  //           And, called on other reactive method.
  protected getICNSFetchData(username: string): ICNSFetchData {
    if (!this._icns) {
      throw new Error("ICNS is not set");
    }

    if (!this.chainGetter.hasChain(this._icns.chainId)) {
      throw new Error(`Can't find chain: ${this._icns.chainId}`);
    }

    const chainIdentifier = ChainIdHelper.parse(this._icns.chainId).identifier;
    const key = `${chainIdentifier}/${this._icns.resolverContractAddress}/${username}`;

    if (!this._icnsFetchDataMap.has(key)) {
      runInAction(() => {
        this._icnsFetchDataMap.set(key, {
          isFetching: true,
        });
      });

      // Assume that this method is called on other reactive method.
      // Thus, below codes will be executed reactively.
      const chainInfo = this.chainGetter.getChain(this._icns.chainId);
      const queryData = JSON.stringify({
        address_by_icns: {
          icns: username,
        },
      });
      fetch(
        new URL(
          `/cosmwasm/wasm/v1/contract/${
            this._icns.resolverContractAddress
          }/smart/${Buffer.from(queryData).toString("base64")}`,
          chainInfo.rest
        ).toString()
      ).then((r) => {
        if (!r.ok) {
          const error = new Error("Failed to fetch");
          runInAction(() => {
            this._icnsFetchDataMap.set(key, {
              isFetching: false,
              error,
            });
          });
        } else {
          r.json().then((data: { data: { bech32_address: string } }) => {
            runInAction(() => {
              this._icnsFetchDataMap.set(key, {
                isFetching: false,
                bech32Address: data.data.bech32_address,
              });
            });
          });
        }
      });
    }
    return this._icnsFetchDataMap.get(key)!;
  }

  @action
  setICNS(icns?: { chainId: string; resolverContractAddress: string }) {
    this._icns = icns;
  }

  get isICNSEnabled(): boolean {
    return !!this._icns;
  }

  @computed
  get isICNSName(): boolean {
    const rawRecipient = this.rawRecipient.trim();

    if (this._icns) {
      return validateICNSName(rawRecipient, this.bech32Prefix);
    }

    return false;
  }

  @computed
  get isICNSFetching(): boolean {
    if (!this.isICNSName) {
      return false;
    }

    const rawRecipient = this.rawRecipient.trim();

    return this.getICNSFetchData(rawRecipient).isFetching;
  }

  get icnsExpectedBech32Prefix(): string {
    return this.bech32Prefix;
  }

  get recipient(): string {
    const rawRecipient = this.rawRecipient.trim();

    if (this.isICNSName) {
      try {
        return this.getICNSFetchData(rawRecipient).bech32Address || "";
      } catch {
        return "";
      }
    }

    if (this._allowHexAddressOnEthermint) {
      const hasEthereumAddress = this.chainInfo.features?.includes(
        "eth-address-gen"
      );
      if (hasEthereumAddress && rawRecipient.startsWith("0x")) {
        try {
          if (isAddress(rawRecipient)) {
            const buf = Buffer.from(
              rawRecipient.replace("0x", "").toLowerCase(),
              "hex"
            );
            return new Bech32Address(buf).toBech32(this.bech32Prefix);
          }
        } catch {
          return "";
        }
        return "";
      }
    }

    return rawRecipient;
  }

  @action
  setAllowHexAddressOnEthermint(value: boolean | undefined) {
    this._allowHexAddressOnEthermint = value;
  }

  @computed
  get error(): Error | undefined {
    const rawRecipient = this.rawRecipient.trim();

    if (!rawRecipient) {
      return new EmptyAddressError("Address is empty");
    }

    if (this.isICNSName) {
      try {
        const fetched = this.getICNSFetchData(rawRecipient);
        if (fetched.isFetching) {
          return new ICNSIsFetchingError("ICNS is fetching");
        }
        if (!fetched.bech32Address) {
          return new ICNSFailedToFetchError(
            "Failed to fetch the address from ICNS"
          );
        }
      } catch (e) {
        return e;
      }
    }

    if (this._allowHexAddressOnEthermint) {
      const hasEthereumAddress = this.chainInfo.features?.includes(
        "eth-address-gen"
      );
      if (hasEthereumAddress && rawRecipient.startsWith("0x")) {
        try {
          if (isAddress(rawRecipient)) {
            return;
          }
        } catch (e) {
          return e;
        }
        return new InvalidHexError("Invalid hex address for chain");
      }
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
  options: {
    allowHexAddressOnEthermint?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
  } = {}
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);
  config.setAllowHexAddressOnEthermint(options.allowHexAddressOnEthermint);
  config.setICNS(options.icns);

  return config;
};
