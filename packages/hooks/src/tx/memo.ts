import { IMemoConfig, UIProperties } from "./types";
import { action, computed, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { TxChainSetter } from "./chain";
import { useState } from "react";
import { MemoSuspectMnemonicInclusion } from "./errors";
import { isMnemonicWord } from "@keplr-wallet/common";

export class MemoConfig extends TxChainSetter implements IMemoConfig {
  @observable
  protected _value: string = "";

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);
    makeObservable(this);
  }

  get memo(): string {
    return this._value;
  }

  get value(): string {
    return this._value;
  }

  @action
  setValue(value: string) {
    this._value = value;
  }

  @computed
  get uiProperties(): UIProperties {
    const words = this.memo
      .trim()
      .split(" ")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
    // If it suspects that user entered mnemonic in memo, treat it as an error.
    // If more than 3/4 of the words are mnemonic words, an error is returned.
    if (words.length >= 8 && words.length <= 32) {
      const n = (words.length / 4) * 3;

      let numMnemonics = 0;
      for (const word of words) {
        if (isMnemonicWord(word.toLowerCase())) {
          numMnemonics++;
        }
      }

      if (numMnemonics >= n) {
        return {
          error: new MemoSuspectMnemonicInclusion("Memo contains mnemonic"),
        };
      }
    }

    return {};
  }
}

export const useMemoConfig = (chainGetter: ChainGetter, chainId: string) => {
  const [config] = useState(() => new MemoConfig(chainGetter, chainId));
  config.setChain(chainId);

  return config;
};
