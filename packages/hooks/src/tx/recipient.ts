import {
  IRecipientConfig,
  IRecipientConfigWithICNS,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { EthereumAccountBase } from "@keplr-wallet/stores-eth";
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
  InvalidBech32Error,
  InvalidHexError,
} from "./errors";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { useState } from "react";
import { Buffer } from "buffer/";
import { validateICNSName } from "@keplr-wallet/common";

interface ICNSFetchData {
  isFetching: boolean;
  bech32Address?: string;
  error?: Error;
}

export class RecipientConfig
  extends TxChainSetter
  implements IRecipientConfig, IRecipientConfigWithICNS
{
  @observable
  protected _value: string = "";

  @observable
  protected _allowHexAddressToBech32Address: boolean | undefined = undefined;

  @observable
  protected _allowHexAddressOnly: boolean | undefined = undefined;

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
      return this.chainInfo.bech32Config?.bech32PrefixAccAddr ?? "";
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
    if (this._icns) {
      return validateICNSName(this.value.trim(), this.bech32Prefix);
    }

    return false;
  }

  @computed
  get isICNSFetching(): boolean {
    if (!this.isICNSName) {
      return false;
    }

    return this.getICNSFetchData(this.value.trim()).isFetching;
  }

  get icnsExpectedBech32Prefix(): string {
    return this.bech32Prefix;
  }

  get recipient(): string {
    const rawRecipient = this.value.trim();

    if (this.isICNSName) {
      try {
        return this.getICNSFetchData(rawRecipient).bech32Address || "";
      } catch {
        return "";
      }
    }

    const chainInfo = this.chainInfo;
    const isEvmChain = !!this.chainInfo.evm;
    const hasEthereumAddress =
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign") ||
      isEvmChain;
    if (
      hasEthereumAddress &&
      EthereumAccountBase.isEthereumHexAddressWithChecksum(rawRecipient) &&
      this._allowHexAddressToBech32Address
    ) {
      return new Bech32Address(
        Buffer.from(rawRecipient.replace("0x", "").toLowerCase(), "hex")
      ).toBech32(this.bech32Prefix);
    }

    return rawRecipient;
  }

  @action
  setAllowHexAddressToBech32Address(value: boolean | undefined) {
    this._allowHexAddressToBech32Address = value;
  }

  @action
  setAllowHexAddressOnly(value: boolean | undefined) {
    this._allowHexAddressOnly = value;
  }

  @computed
  get uiProperties(): UIProperties {
    const rawRecipient = this.value.trim();

    if (!rawRecipient) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    if (this.isICNSName) {
      try {
        const fetched = this.getICNSFetchData(rawRecipient);

        if (fetched.isFetching) {
          return {
            loadingState: "loading-block",
          };
        }

        if (!fetched.bech32Address) {
          return {
            error: new ICNSFailedToFetchError(
              "Failed to fetch the address from ICNS"
            ),
            loadingState: fetched.isFetching ? "loading-block" : undefined,
          };
        }

        if (fetched.error) {
          return {
            error: new ICNSFailedToFetchError(
              "Failed to fetch the address from ICNS"
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

    const chainInfo = this.chainInfo;
    const isEvmChain = !!this.chainInfo.evm;
    const hasEthereumAddress =
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign") ||
      isEvmChain;
    if (
      hasEthereumAddress &&
      (rawRecipient.startsWith("0x") || this._allowHexAddressOnly)
    ) {
      if (EthereumAccountBase.isEthereumHexAddressWithChecksum(rawRecipient)) {
        return {};
      } else {
        return {
          error: new InvalidHexError("Invalid hex address for chain"),
        };
      }
    }

    try {
      Bech32Address.validate(this.recipient, this.bech32Prefix);
    } catch (e) {
      return {
        error: new InvalidBech32Error(
          `Invalid bech32: ${e.message || e.toString()}`
        ),
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

  @computed
  get isRecipientEthereumHexAddress(): boolean {
    const rawRecipient = this.value.trim();
    return EthereumAccountBase.isEthereumHexAddressWithChecksum(rawRecipient);
  }
}

export const useRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  options: {
    allowHexAddressToBech32Address?: boolean;
    allowHexAddressOnly?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
  } = {}
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);
  config.setAllowHexAddressToBech32Address(
    options.allowHexAddressToBech32Address
  );
  config.setAllowHexAddressToBech32Address(options.allowHexAddressOnly);
  config.setICNS(options.icns);

  return config;
};
