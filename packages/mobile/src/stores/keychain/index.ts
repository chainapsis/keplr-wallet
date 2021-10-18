import { flow, makeObservable, observable } from "mobx";
import * as Keychain from "react-native-keychain";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { KeyRingStore } from "@keplr-wallet/stores";

export class KeychainStore {
  @observable
  protected _isBiometrySupported: boolean = false;

  @observable
  protected _isBiometryOn: boolean = false;

  protected static defaultOptions: Keychain.Options = {
    authenticationPrompt: {
      title: "Biometric Authentication",
    },
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  };

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);

    this.init();
  }

  get isBiometrySupported(): boolean {
    return this._isBiometrySupported;
  }

  get isBiometryOn(): boolean {
    return this._isBiometryOn;
  }

  @flow
  *tryUnlockWithBiometry() {
    if (!this.isBiometryOn) {
      throw new Error("Biometry is off");
    }

    const credentials = yield* toGenerator(
      Keychain.getGenericPassword(KeychainStore.defaultOptions)
    );
    if (credentials) {
      yield this.keyRingStore.unlock(credentials.password);
    } else {
      throw new Error("Failed to get credentials from keychain");
    }
  }

  @flow
  *turnOnBiometry(password: string) {
    const valid = yield* toGenerator(this.keyRingStore.checkPassword(password));
    if (valid) {
      const result = yield* toGenerator(
        Keychain.setGenericPassword(
          "keplr",
          password,
          KeychainStore.defaultOptions
        )
      );
      if (result) {
        this._isBiometryOn = true;
        yield this.save();
      }
    } else {
      throw new Error("Invalid password");
    }
  }

  @flow
  *turnOffBiometry() {
    if (this.isBiometryOn) {
      const credentials = yield* toGenerator(
        Keychain.getGenericPassword(KeychainStore.defaultOptions)
      );
      if (credentials) {
        if (
          yield* toGenerator(
            this.keyRingStore.checkPassword(credentials.password)
          )
        ) {
          const result = yield* toGenerator(
            Keychain.resetGenericPassword(KeychainStore.defaultOptions)
          );
          if (result) {
            this._isBiometryOn = false;
            yield this.save();
          }
        }
      }
    }
  }

  @flow
  *reset() {
    if (this.isBiometryOn) {
      const result = yield* toGenerator(
        Keychain.resetGenericPassword(KeychainStore.defaultOptions)
      );
      if (result) {
        this._isBiometryOn = false;
        yield this.save();
      }
    }
  }

  @flow
  protected *init() {
    // No need to await.
    this.restore();

    const type = yield* toGenerator(
      Keychain.getSupportedBiometryType(KeychainStore.defaultOptions)
    );
    this._isBiometrySupported = type != null;
  }

  @flow
  protected *restore() {
    const saved = yield* toGenerator(this.kvStore.get("isBiometryOn"));
    this._isBiometryOn = saved === true;
  }

  protected async save() {
    await this.kvStore.set("isBiometryOn", this.isBiometryOn);
  }
}
