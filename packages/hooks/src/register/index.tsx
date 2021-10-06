import React, { FunctionComponent, useState } from "react";
import { KeyRingStore } from "@keplr-wallet/stores";
import { action, computed, flow, makeObservable, observable } from "mobx";
import { Mnemonic, RNG } from "@keplr-wallet/crypto";
import { BIP44HDPath } from "@keplr-wallet/background";

export type RegisterMode = "create" | "add";

export type RegisterOption = {
  type: string;
  intro: FunctionComponent<{
    registerConfig: RegisterConfig;
  }>;
  page: FunctionComponent<{
    registerConfig: RegisterConfig;
  }>;
};

export class RegisterConfig {
  protected keyRingStore: KeyRingStore;

  // Indicate wether the account is creating or not.
  @observable
  protected _isLoading: boolean = false;

  @observable.shallow
  protected options: RegisterOption[] = [];

  @observable
  protected _type: string = "";

  @observable
  protected _isFinalized: boolean = false;

  constructor(
    keyRingStore: KeyRingStore,
    options: RegisterOption[],
    protected readonly rng: RNG
  ) {
    this.keyRingStore = keyRingStore;
    makeObservable(this);

    for (const option of options) {
      this.addRegisterOption(option.type, option.intro, option.page);
    }
  }

  @computed
  get mode(): RegisterMode {
    return this.keyRingStore.multiKeyStoreInfo.length === 0 ? "create" : "add";
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isFinalized(): boolean {
    return this._isFinalized;
  }

  @action
  addRegisterOption(
    type: string,
    intro: RegisterOption["intro"],
    page: RegisterOption["page"]
  ) {
    this.options.push({
      type,
      intro,
      page,
    });
  }

  @action
  setType(type: string) {
    this._type = type;
  }

  get type(): string {
    return this._type;
  }

  get isIntro(): boolean {
    return this._type === "";
  }

  @action
  clear() {
    this.setType("");
  }

  // Create or add the mnemonic account.
  // If the mode is "add", password will be ignored.
  @flow
  *createMnemonic(
    name: string,
    mnemonic: string,
    password: string,
    bip44HDPath: BIP44HDPath,
    meta: Record<string, string> = {}
  ) {
    this._isLoading = true;
    try {
      if (this.mode === "create") {
        yield this.keyRingStore.createMnemonicKey(
          mnemonic,
          password,
          {
            name,
            ...meta,
          },
          bip44HDPath
        );
      } else {
        yield this.keyRingStore.addMnemonicKey(
          mnemonic,
          {
            name,
            ...meta,
          },
          bip44HDPath
        );
      }
      this._isFinalized = true;
    } finally {
      this._isLoading = false;
    }
  }

  // Create or add the ledger account.
  // If the mode is "add", password will be ignored.
  @flow
  *createLedger(name: string, password: string, bip44HDPath: BIP44HDPath) {
    this._isLoading = true;
    try {
      if (this.mode === "create") {
        yield this.keyRingStore.createLedgerKey(
          password,
          {
            name,
          },
          bip44HDPath
        );
      } else {
        yield this.keyRingStore.addLedgerKey(
          {
            name,
          },
          bip44HDPath
        );
      }
      this._isFinalized = true;
    } finally {
      this._isLoading = false;
    }
  }

  // Create or add the account based on the private key.
  // If the mode is "add", password will be ignored.
  @flow
  *createPrivateKey(
    name: string,
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string> = {}
  ) {
    this._isLoading = true;
    try {
      if (this.mode === "create") {
        yield this.keyRingStore.createPrivateKey(privateKey, password, {
          name,
          ...meta,
        });
      } else {
        yield this.keyRingStore.addPrivateKey(privateKey, {
          name,
          ...meta,
        });
      }
      this._isFinalized = true;
    } finally {
      this._isLoading = false;
    }
  }

  async generateMnemonic(strenth: number = 128): Promise<string> {
    return await Mnemonic.generateSeed(this.rng, strenth);
  }

  render() {
    return (
      <div>
        {this.isIntro
          ? this.options.map((option) => {
              return (
                <React.Fragment key={option.type}>
                  <option.intro registerConfig={this} />
                </React.Fragment>
              );
            })
          : !this.isFinalized
          ? this.options.map((option) => {
              if (option.type === this.type) {
                return (
                  <React.Fragment key={option.type}>
                    <option.page registerConfig={this} />
                  </React.Fragment>
                );
              }
            })
          : null}
      </div>
    );
  }
}

// CONTRACT: Use with `observer`.
export const useRegisterConfig = (
  keyRingStore: KeyRingStore,
  initialOptions: RegisterOption[],
  rng: RNG = (array) => {
    return Promise.resolve(crypto.getRandomValues(array));
  }
) => {
  const [txConfig] = useState(
    () => new RegisterConfig(keyRingStore, initialOptions, rng)
  );

  return txConfig;
};
