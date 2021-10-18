import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  AddLedgerKeyMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  BIP44HDPath,
  ChangeKeyRingMsg,
  CreateLedgerKeyMsg,
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  DeleteKeyRingMsg,
  UpdateNameKeyRingMsg,
  GetIsKeyStoreCoinTypeSetMsg,
  GetMultiKeyStoreInfoMsg,
  KeyRingStatus,
  LockKeyRingMsg,
  MultiKeyStoreInfoWithSelected,
  RestoreKeyRingMsg,
  SetKeyStoreCoinTypeMsg,
  ShowKeyRingMsg,
  UnlockKeyRingMsg,
  KeyRing,
  CheckPasswordMsg,
  ExportKeyRingData,
  ExportKeyRingDatasMsg,
} from "@keplr-wallet/background";

import { computed, flow, makeObservable, observable, runInAction } from "mobx";

import { InteractionStore } from "./interaction";
import { ChainGetter } from "../common";
import { BIP44 } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { toGenerator } from "@keplr-wallet/common";

export class KeyRingSelectablesStore {
  @observable
  isInitializing: boolean = false;

  @observable
  protected _isKeyStoreCoinTypeSet: boolean = false;

  @observable.ref
  _selectables: {
    path: BIP44;
    bech32Address: string;
  }[] = [];

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly requester: MessageRequester,
    protected readonly chainId: string,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);

    this.refresh();
  }

  @computed
  get needSelectCoinType(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (
      !chainInfo.alternativeBIP44s ||
      chainInfo.alternativeBIP44s.length === 0
    ) {
      return false;
    }
    return !this.isInitializing && !this._isKeyStoreCoinTypeSet;
  }

  get selectables(): DeepReadonly<
    {
      path: BIP44;
      bech32Address: string;
    }[]
  > {
    return this._selectables;
  }

  @flow
  *refresh() {
    // No need to set the coin type if the key store type is not mnemonic.
    if (this.keyRingStore.keyRingType !== "mnemonic") {
      this.isInitializing = false;
      this._isKeyStoreCoinTypeSet = true;
      this._selectables = [];

      return;
    }

    this.isInitializing = true;

    const chainInfo = this.chainGetter.getChain(this.chainId);

    const msg = new GetIsKeyStoreCoinTypeSetMsg(this.chainId, [
      chainInfo.bip44,
      ...(chainInfo.alternativeBIP44s ?? []),
    ]);
    const seletables = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    if (seletables.length === 0) {
      this._isKeyStoreCoinTypeSet = true;
    } else if (seletables.length === 1) {
      yield this.keyRingStore.setKeyStoreCoinType(
        this.chainId,
        seletables[0].path.coinType
      );
      this._isKeyStoreCoinTypeSet = true;
    } else {
      this._selectables = seletables;
      this._isKeyStoreCoinTypeSet = false;
    }

    this.isInitializing = false;
  }
}

/*
 Actual key ring logic is managed in persistent background. Refer "src/common/message" and "src/background/keyring"
 This store only interact with key ring in persistent background.
 */
export class KeyRingStore {
  @observable
  status: KeyRingStatus = KeyRingStatus.NOTLOADED;

  @observable
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected = [];

  @observable.shallow
  protected selectablesMap: Map<string, KeyRingSelectablesStore> = new Map();

  constructor(
    protected readonly eventDispatcher: {
      dispatchEvent: (type: string) => void;
    },
    public readonly defaultKdf: "scrypt" | "sha256" | "pbkdf2",
    protected readonly chainGetter: ChainGetter,
    protected readonly requester: MessageRequester,
    protected readonly interactionStore: InteractionStore
  ) {
    makeObservable(this);

    this.restore();
  }

  @computed
  get keyRingType(): string {
    const keyStore = this.multiKeyStoreInfo.find(
      (keyStore) => keyStore.selected
    );

    if (!keyStore) {
      return "none";
    } else {
      return KeyRing.getTypeOfKeyStore(keyStore);
    }
  }

  @flow
  *createMnemonicKey(
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    kdf: "scrypt" | "sha256" | "pbkdf2" = this.defaultKdf
  ) {
    const msg = new CreateMnemonicKeyMsg(
      kdf,
      mnemonic,
      password,
      meta,
      bip44HDPath
    );
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;
    this.multiKeyStoreInfo = result.multiKeyStoreInfo;
  }

  @flow
  *createPrivateKey(
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>,
    kdf: "scrypt" | "sha256" | "pbkdf2" = this.defaultKdf
  ) {
    const msg = new CreatePrivateKeyMsg(kdf, privateKey, password, meta);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;
    this.multiKeyStoreInfo = result.multiKeyStoreInfo;
  }

  @flow
  *createLedgerKey(
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    kdf: "scrypt" | "sha256" | "pbkdf2" = this.defaultKdf
  ) {
    const msg = new CreateLedgerKeyMsg(kdf, password, meta, bip44HDPath);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;
    this.multiKeyStoreInfo = result.multiKeyStoreInfo;
  }

  @flow
  *addMnemonicKey(
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    kdf: "scrypt" | "sha256" | "pbkdf2" = this.defaultKdf
  ) {
    const msg = new AddMnemonicKeyMsg(kdf, mnemonic, meta, bip44HDPath);
    this.multiKeyStoreInfo = (yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    )).multiKeyStoreInfo;
  }

  @flow
  *addPrivateKey(
    privateKey: Uint8Array,
    meta: Record<string, string>,
    kdf: "scrypt" | "sha256" | "pbkdf2" = this.defaultKdf
  ) {
    const msg = new AddPrivateKeyMsg(kdf, privateKey, meta);
    this.multiKeyStoreInfo = (yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    )).multiKeyStoreInfo;
  }

  @flow
  *addLedgerKey(
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath,
    kdf: "scrypt" | "sha256" | "pbkdf2" = this.defaultKdf
  ) {
    const msg = new AddLedgerKeyMsg(kdf, meta, bip44HDPath);
    this.multiKeyStoreInfo = (yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    )).multiKeyStoreInfo;
  }

  @flow
  *changeKeyRing(index: number) {
    const msg = new ChangeKeyRingMsg(index);
    this.multiKeyStoreInfo = (yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    )).multiKeyStoreInfo;

    // Emit the key store changed event manually.
    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
    this.selectablesMap.forEach((selectables) => selectables.refresh());
  }

  @flow
  *lock() {
    const msg = new LockKeyRingMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;
  }

  @flow
  *unlock(password: string) {
    const msg = new UnlockKeyRingMsg(password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;

    // Approve all waiting interaction for the enabling key ring.
    for (const interaction of this.interactionStore.getDatas("unlock")) {
      yield this.interactionStore.approve("unlock", interaction.id, {});
    }

    this.eventDispatcher.dispatchEvent("keplr_keystoreunlock");
    this.selectablesMap.forEach((selectables) => selectables.refresh());
  }

  @flow
  *rejectAll() {
    yield this.interactionStore.rejectAll("unlock");
  }

  @flow
  protected *restore() {
    const msg = new RestoreKeyRingMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;
    this.multiKeyStoreInfo = result.multiKeyStoreInfo;
  }

  async showKeyRing(index: number, password: string) {
    const msg = new ShowKeyRingMsg(index, password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  @flow
  *deleteKeyRing(index: number, password: string) {
    const selectedIndex = this.multiKeyStoreInfo.findIndex(
      (keyStore) => keyStore.selected
    );
    const msg = new DeleteKeyRingMsg(index, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.status = result.status;
    this.multiKeyStoreInfo = result.multiKeyStoreInfo;

    // Selected keystore may be changed if the selected one is deleted.
    if (selectedIndex === index) {
      this.eventDispatcher.dispatchEvent("keplr_keystorechange");
      this.selectablesMap.forEach((selectables) => selectables.refresh());
    }
  }

  @flow
  *updateNameKeyRing(index: number, name: string) {
    const msg = new UpdateNameKeyRingMsg(index, name);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.multiKeyStoreInfo = result.multiKeyStoreInfo;
    const selectedIndex = this.multiKeyStoreInfo.findIndex(
      (keyStore) => keyStore.selected
    );
    // If selectedIndex and index are same, name could be changed, so dispatch keystore event
    if (selectedIndex === index) {
      this.eventDispatcher.dispatchEvent("keplr_keystorechange");
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new CheckPasswordMsg(password)
    );
  }

  getKeyStoreSelectables(chainId: string): KeyRingSelectablesStore {
    if (!this.selectablesMap.has(chainId)) {
      runInAction(() => {
        this.selectablesMap.set(
          chainId,
          new KeyRingSelectablesStore(
            this.chainGetter,
            this.requester,
            chainId,
            this
          )
        );
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.selectablesMap.get(chainId)!;
  }

  // Set the coin type to current key store.
  // And, save it, refresh the key store.
  @flow
  *setKeyStoreCoinType(chainId: string, coinType: number) {
    const status = yield* toGenerator(
      this.requester.sendMessage(
        BACKGROUND_PORT,
        new SetKeyStoreCoinTypeMsg(chainId, coinType)
      )
    );

    this.multiKeyStoreInfo = (yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, new GetMultiKeyStoreInfoMsg())
    )).multiKeyStoreInfo;

    this.status = status;

    // Emit the key store changed event manually.
    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
    this.selectablesMap.forEach((selectables) => selectables.refresh());
  }

  async exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new ExportKeyRingDatasMsg(password)
    );
  }
}
