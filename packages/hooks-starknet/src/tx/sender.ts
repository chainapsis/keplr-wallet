import { ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { useState } from "react";
import { StarknetQueriesStore } from "@keplr-wallet/stores-starknet";
import {
  AccountNotDeployed,
  EmptyAddressError,
  InvalidHexError,
} from "./errors";
import { Buffer } from "buffer";

export class SenderConfig extends TxChainSetter implements ISenderConfig {
  @observable
  protected _value: string = "";

  constructor(
    chainGetter: ChainGetter,
    protected readonly starknetQueriesStore: StarknetQueriesStore,
    initialChainId: string,
    initialSender: string
  ) {
    super(chainGetter, initialChainId);

    this._value = initialSender;

    makeObservable(this);
  }

  get sender(): string {
    return this._value;
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string): void {
    this._value = value;
  }

  get uiProperties(): UIProperties {
    if (!this.value) {
      return {
        error: new EmptyAddressError("Address is empty"),
      };
    }

    if (!this.value.startsWith("0x")) {
      return {
        error: new InvalidHexError("Invalid hex address for chain"),
      };
    }

    {
      const hex = this.value.replace("0x", "");
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

    const queryNonce = this.starknetQueriesStore
      .get(this.chainId)
      .queryAccountNonce.getNonce(this.value);
    if (!queryNonce.response && !queryNonce.error) {
      return {
        loadingState: "loading-block",
      };
    }

    if (queryNonce.error?.message === "Contract not found") {
      return {
        error: new AccountNotDeployed("Account not deployed"),
      };
    }

    return {};
  }
}

export const useSenderConfig = (
  chainGetter: ChainGetter,
  starknetQueriesStore: StarknetQueriesStore,
  chainId: string,
  sender: string
) => {
  const [config] = useState(
    () => new SenderConfig(chainGetter, starknetQueriesStore, chainId, sender)
  );
  config.setChain(chainId);
  config.setValue(sender);

  return config;
};
