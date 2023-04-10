import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { flow, makeObservable, observable, runInAction } from "mobx";
import { toGenerator } from "@keplr-wallet/common";
import { KeyRingV2 } from "@keplr-wallet/background";

export class KeyRingStore {
  @observable
  protected _status: KeyRingV2.KeyRingStatus | "not-loaded" = "not-loaded";

  @observable.ref
  protected _keyInfos: KeyRingV2.KeyInfo[] = [];

  constructor(protected readonly requester: MessageRequester) {
    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    const msg = new KeyRingV2.GetKeyRingStatusMsg();
    const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      this._status = result.status;
      this._keyInfos = result.keyInfos;
    });
  }

  get status(): KeyRingV2.KeyRingStatus | "not-loaded" {
    return this._status;
  }

  get keyInfos(): KeyRingV2.KeyInfo[] {
    return this._keyInfos;
  }

  get isEmpty(): boolean {
    return this._status === "empty";
  }

  @flow
  *newMnemonicKey(
    mnemonic: string,
    bip44HDPath: KeyRingV2.BIP44HDPath,
    name: string,
    password: string | undefined
  ) {
    const msg = new KeyRingV2.NewMnemonicKeyMsg(
      mnemonic,
      bip44HDPath,
      name,
      password
    );
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;
  }

  @flow
  *newLedgerKey(
    pubKey: Uint8Array,
    app: string,
    bip44HDPath: KeyRingV2.BIP44HDPath,
    name: string,
    password: string | undefined
  ) {
    const msg = new KeyRingV2.NewLedgerKeyMsg(
      pubKey,
      app,
      bip44HDPath,
      name,
      password
    );
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;
  }

  @flow
  *lock() {
    const msg = new KeyRingV2.LockKeyRingMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
  }

  @flow
  *unlock(password: string) {
    const msg = new KeyRingV2.UnlockKeyRingMsg(password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
  }
}
