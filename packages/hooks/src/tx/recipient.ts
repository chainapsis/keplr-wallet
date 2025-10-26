import {
  IRecipientConfig,
  IRecipientConfigWithNameServices,
  UIProperties,
} from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { EthereumAccountBase } from "@keplr-wallet/stores-eth";
import { action, computed, makeObservable, observable } from "mobx";
import {
  EmptyAddressError,
  InvalidBech32Error,
  InvalidHexError,
} from "./errors";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useState } from "react";
import { Buffer } from "buffer/";
import { NameService } from "./name-service";
import { ICNSNameService } from "./name-service-icns";
import { ENSNameService } from "./name-service-ens";

export class RecipientConfig
  extends TxChainSetter
  implements IRecipientConfig, IRecipientConfigWithNameServices
{
  @observable
  protected _value: string = "";

  @observable
  protected _allowHexAddressToBech32Address: boolean | undefined = undefined;

  @observable
  protected _allowHexAddressOnly: boolean | undefined = undefined;

  @observable
  protected _bech32Prefix: string | undefined = undefined;

  @observable
  protected _preferredNameService: string | undefined = undefined;

  @observable.ref
  protected nameServices: NameService[] = [];

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    this.nameServices.push(new ICNSNameService(this, chainGetter));
    this.nameServices.push(new ENSNameService(this, chainGetter));

    makeObservable(this);
  }

  get preferredNameService(): string | undefined {
    return this._preferredNameService;
  }

  @action
  setPreferredNameService(nameService: string | undefined) {
    this._preferredNameService = nameService;
  }

  getNameService(type: string): NameService | undefined {
    return this.nameServices.find((nameService) => nameService.type === type);
  }

  getNameServices(): NameService[] {
    return this.nameServices;
  }

  @computed
  get nameServiceResult(): {
    type: string;
    address: string;
    fullName: string;
    domain: string;
    suffix: string;
  }[] {
    const result: {
      type: string;
      address: string;
      fullName: string;
      domain: string;
      suffix: string;
    }[] = [];
    for (const nameService of this.nameServices) {
      if (
        this.preferredNameService &&
        nameService.type !== this.preferredNameService
      ) {
        continue;
      }

      const r = nameService.result;
      if (r) {
        result.push({
          ...r,
          type: nameService.type,
        });
      }
    }
    return result;
  }

  @action
  setENS(options?: { chainId: string }) {
    const i = this.nameServices.findIndex(
      (nameService) => nameService.type === "ens"
    );

    if (!options) {
      if (i >= 0) {
        this.nameServices.splice(i, 1);
      }
      return;
    }

    if (i >= 0) {
      const found = this.nameServices[i];
      (found as ENSNameService).setENS(options);
    } else {
      this.nameServices.push(
        new ENSNameService(this, this.chainGetter, options)
      );
    }
  }

  @action
  setICNS(
    options:
      | {
          chainId: string;
          resolverContractAddress: string;
        }
      | undefined
  ) {
    const i = this.nameServices.findIndex(
      (nameService) => nameService.type === "icns"
    );

    if (!options) {
      if (i >= 0) {
        this.nameServices.splice(i, 1);
      }
      return;
    }

    if (i >= 0) {
      const found = this.nameServices[i];
      (found as ICNSNameService).setICNS(options);
    } else {
      this.nameServices.push(
        new ICNSNameService(this, this.chainGetter, options)
      );
    }
  }

  @computed
  get bech32Prefix(): string {
    if (!("cosmos" in this.chainInfo)) {
      return "";
    }

    if (!this._bech32Prefix) {
      return this.chainInfo.cosmos.bech32Config?.bech32PrefixAccAddr ?? "";
    }

    return this._bech32Prefix;
  }

  @action
  setBech32Prefix(prefix: string) {
    this._bech32Prefix = prefix;
  }

  get recipient(): string {
    if (this.nameServiceResult.length > 0) {
      const r = this.nameServiceResult[0];
      return r.address;
    }

    const rawRecipient = this.value.trim();

    const chainInfo = this.chainInfo;
    const isEvmChain = "evm" in chainInfo && chainInfo.evm;
    const hasEthereumAddress =
      isEvmChain ||
      ("cosmos" in chainInfo &&
        (chainInfo.cosmos.bip44.coinType === 60 ||
          !!chainInfo.cosmos.features?.includes("eth-address-gen") ||
          !!chainInfo.cosmos.features?.includes("eth-key-sign")));

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
    let rawRecipient = this.value.trim();

    if (!rawRecipient) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    if (this.nameServiceResult.length > 0) {
      const r = this.nameServiceResult[0];
      rawRecipient = r.address;
    }

    const chainInfo = this.chainInfo;
    const isEvmChain = "evm" in chainInfo && chainInfo.evm;
    const hasEthereumAddress =
      isEvmChain ||
      ("cosmos" in chainInfo &&
        (chainInfo.cosmos.bip44.coinType === 60 ||
          !!chainInfo.cosmos.features?.includes("eth-address-gen") ||
          !!chainInfo.cosmos.features?.includes("eth-key-sign")));
    const isHexAddressAllowed =
      this._allowHexAddressOnly ||
      (rawRecipient.startsWith("0x") && this._allowHexAddressToBech32Address);

    if (hasEthereumAddress && isHexAddressAllowed) {
      if (EthereumAccountBase.isEthereumHexAddressWithChecksum(rawRecipient)) {
        return {};
      } else {
        return {
          error: new InvalidHexError("Not found"),
        };
      }
    }

    try {
      Bech32Address.validate(this.recipient, this.bech32Prefix);
    } catch (e) {
      const i = this.recipient.indexOf("1");
      if (i >= 1) {
        return {
          error: new InvalidBech32Error(
            `Invalid bech32: ${e.message || e.toString()}`
          ),
        };
      }
      return {
        error: new InvalidBech32Error("Not found"),
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

    for (const nameService of this.nameServices) {
      nameService.setValue(value);
    }
  }

  @computed
  get isRecipientEthereumHexAddress(): boolean {
    return EthereumAccountBase.isEthereumHexAddressWithChecksum(this.recipient);
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
    ens?: {
      chainId: string;
    };
  } = {}
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);
  config.setAllowHexAddressToBech32Address(
    options.allowHexAddressToBech32Address
  );
  config.setAllowHexAddressOnly(options.allowHexAddressOnly);
  config.setICNS(options.icns);
  config.setENS(options.ens);

  return config;
};
