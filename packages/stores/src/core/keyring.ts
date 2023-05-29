import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  autorun,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { toGenerator } from "@keplr-wallet/common";
import {
  AppendLedgerKeyAppMsg,
  BIP44HDPath,
  ChangeKeyRingNameMsg,
  ChangeUserPasswordMsg,
  CheckLegacyKeyRingPasswordMsg,
  ComputeNotFinalizedMnemonicKeyAddressesMsg,
  DeleteKeyRingMsg,
  FinalizeMnemonicKeyCoinTypeMsg,
  GetKeyRingStatusMsg,
  GetKeyRingStatusOnlyMsg,
  KeyInfo,
  KeyRingStatus,
  LockKeyRingMsg,
  NewLedgerKeyMsg,
  NewMnemonicKeyMsg,
  NewPrivateKeyKeyMsg,
  PlainObject,
  SelectKeyRingMsg,
  ShowSensitiveKeyRingDataMsg,
  UnlockKeyRingMsg,
} from "@keplr-wallet/background";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class KeyRingStore {
  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _status: KeyRingStatus | "not-loaded" = "not-loaded";

  @observable
  protected _needMigration: boolean = false;

  @observable
  protected _isMigrating: boolean = false;

  @observable.ref
  protected _keyInfos: KeyInfo[] = [];

  constructor(
    protected readonly eventDispatcher: {
      dispatchEvent: (type: string) => void;
    },
    protected readonly requester: MessageRequester
  ) {
    makeObservable(this);

    this.init();
  }

  async init(): Promise<void> {
    const msg = new GetKeyRingStatusMsg();
    const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      this._status = result.status;
      this._keyInfos = result.keyInfos;
      this._needMigration = result.needMigration;
      this._isMigrating = result.isMigrating;

      this._isInitialized = true;
    });
  }

  get needMigration(): boolean {
    return this._needMigration;
  }

  get isMigrating(): boolean {
    return this._isMigrating;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async waitUntilInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (this.isInitialized) {
          resolve();

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }

  get status(): KeyRingStatus | "not-loaded" {
    return this._status;
  }

  get keyInfos(): KeyInfo[] {
    return this._keyInfos;
  }

  async fetchKeyRingStatus(): Promise<KeyRingStatus> {
    const msg = new GetKeyRingStatusOnlyMsg();
    const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    return result.status;
  }

  @computed
  get selectedKeyInfo(): KeyInfo | undefined {
    return this._keyInfos.find((keyInfo) => keyInfo.isSelected);
  }

  get isEmpty(): boolean {
    return this._status === "empty";
  }

  @flow
  *selectKeyRing(vaultId: string) {
    const msg = new SelectKeyRingMsg(vaultId);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  needMnemonicKeyCoinTypeFinalize(
    vaultId: string,
    chainInfo: ChainInfo
  ): boolean {
    const keyInfo = this.keyInfos.find((keyInfo) => keyInfo.id === vaultId);
    if (!keyInfo) {
      return false;
    }

    if (keyInfo.type !== "mnemonic") {
      return false;
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainInfo.chainId).identifier
    }-coinType`;

    return keyInfo.insensitive[coinTypeTag] == null;
  }

  async computeNotFinalizedMnemonicKeyAddresses(
    vaultId: string,
    chainId: string
  ): Promise<
    {
      coinType: number;
      bech32Address: string;
    }[]
  > {
    const msg = new ComputeNotFinalizedMnemonicKeyAddressesMsg(
      vaultId,
      chainId
    );

    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async showKeyRing(vaultId: string, password: string) {
    const msg = new ShowSensitiveKeyRingDataMsg(vaultId, password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  @flow
  *finalizeMnemonicKeyCoinType(
    vaultId: string,
    chainId: string,
    coinType: number
  ) {
    const msg = new FinalizeMnemonicKeyCoinTypeMsg(vaultId, chainId, coinType);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  @flow
  *newMnemonicKey(
    mnemonic: string,
    bip44HDPath: BIP44HDPath,
    name: string,
    password: string | undefined
  ) {
    const msg = new NewMnemonicKeyMsg(mnemonic, bip44HDPath, name, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
  }

  @flow
  *newLedgerKey(
    pubKey: Uint8Array,
    app: string,
    bip44HDPath: BIP44HDPath,
    name: string,
    password: string | undefined
  ) {
    const msg = new NewLedgerKeyMsg(pubKey, app, bip44HDPath, name, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
  }

  @flow
  *appendLedgerKeyApp(vaultId: string, pubKey: Uint8Array, app: string) {
    const msg = new AppendLedgerKeyAppMsg(vaultId, pubKey, app);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  @flow
  *newPrivateKeyKey(
    privateKey: Uint8Array,
    meta: PlainObject,
    name: string,
    password: string | undefined
  ) {
    const msg = new NewPrivateKeyKeyMsg(privateKey, meta, name, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
  }

  @flow
  *lock() {
    const msg = new LockKeyRingMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
  }

  @flow
  *unlock(password: string) {
    if (this._needMigration) {
      this._isMigrating = true;
    }

    try {
      const msg = new UnlockKeyRingMsg(password);
      const result = yield* toGenerator(
        this.requester.sendMessage(BACKGROUND_PORT, msg)
      );
      this._status = result.status;
      this._keyInfos = result.keyInfos;

      this._needMigration = false;
    } finally {
      // Set the flag to false even if the migration is failed.
      this._isMigrating = false;
    }
  }

  @flow
  *changeKeyRingName(vaultId: string, name: string) {
    const msg = new ChangeKeyRingNameMsg(vaultId, name);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  @flow
  *deleteKeyRing(vaultId: string, password: string) {
    const msg = new DeleteKeyRingMsg(vaultId, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    if (result.wasSelected && result.status === "unlocked") {
      this.eventDispatcher.dispatchEvent("keplr_keystorechange");
    }
  }

  async changeUserPassword(
    prevUserPassword: string,
    newUserPassword: string
  ): Promise<void> {
    const msg = new ChangeUserPasswordMsg(prevUserPassword, newUserPassword);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async checkLegacyKeyRingPassword(password: string): Promise<void> {
    const msg = new CheckLegacyKeyRingPasswordMsg(password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}
