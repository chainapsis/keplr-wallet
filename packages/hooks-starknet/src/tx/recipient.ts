import { IRecipientConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { InvalidHexError } from "./errors";
import { useState } from "react";
import { Buffer } from "buffer/";

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
    if (!("starknet" in modularChainInfo)) {
      throw new Error("Chain doesn't support the starknet");
    }

    return rawRecipient;
  }

  @computed
  get uiProperties(): UIProperties {
    const rawRecipient = this.value.trim();

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
