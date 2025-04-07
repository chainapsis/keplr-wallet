import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";
import validate, { Network, getAddressInfo } from "bitcoin-address-validation";
import { IRecipientConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { EmptyAddressError, InvalidBitcoinAddressError } from "./errors";
import { GENESIS_HASH_TO_NETWORK, GenesisHash } from "@keplr-wallet/types";

export class RecipientConfig extends TxChainSetter implements IRecipientConfig {
  @observable
  protected _value: string = "";

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  get recipient(): string {
    const rawRecipient = this.value.trim();

    const modularChainInfo = this.modularChainInfo;
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error("Chain doesn't support the bitcoin");
    }

    const [, genesisHash] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (!network) {
      return "";
    }

    try {
      const addressInfo = getAddressInfo(rawRecipient, {
        castTestnetTo: network === "signet" ? Network.signet : undefined,
      });

      // CHECK: allow multisig address as recipient?
      return addressInfo.address;
    } catch (_e) {
      return "";
    }
  }

  @computed
  get uiProperties(): UIProperties {
    const rawRecipient = this.value.trim();

    if (!rawRecipient) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    const [, genesisHash] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (!network) {
      return {
        error: new InvalidBitcoinAddressError("Unsupported network"),
      };
    }

    try {
      const isValid = validate(this.value, network as unknown as Network, {
        castTestnetTo: network === "signet" ? Network.signet : undefined,
      });

      if (!isValid) {
        return {
          error: new InvalidBitcoinAddressError(
            `Invalid Bitcoin address for ${network}`
          ),
        };
      }

      return {};
    } catch (e) {
      return {
        error: e,
      };
    }
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
