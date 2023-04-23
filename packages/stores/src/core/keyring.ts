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
  ComputeNotFinalizedMnemonicKeyAddressesMsg,
  KeyRingV2,
} from "@keplr-wallet/background";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class KeyRingStore {
  @observable
  protected _isInitialized: boolean = false;

  @observable
  protected _status: KeyRingV2.KeyRingStatus | "not-loaded" = "not-loaded";

  @observable.ref
  protected _keyInfos: KeyRingV2.KeyInfo[] = [];

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
    const msg = new KeyRingV2.GetKeyRingStatusMsg();
    const result = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    runInAction(() => {
      this._status = result.status;
      this._keyInfos = result.keyInfos;

      this._isInitialized = true;
    });
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

  get status(): KeyRingV2.KeyRingStatus | "not-loaded" {
    return this._status;
  }

  get keyInfos(): KeyRingV2.KeyInfo[] {
    return this._keyInfos;
  }

  @computed
  get selectedKeyInfo(): KeyRingV2.KeyInfo | undefined {
    return this._keyInfos.find((keyInfo) => keyInfo.isSelected);
  }

  get isEmpty(): boolean {
    return this._status === "empty";
  }

  @flow
  *selectKeyRing(vaultId: string) {
    const msg = new KeyRingV2.SelectKeyRingMsg(vaultId);
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
    const msg = new KeyRingV2.ShowSensitiveKeyRingDataMsg(vaultId, password);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  @flow
  *finalizeMnemonicKeyCoinType(
    vaultId: string,
    chainId: string,
    coinType: number
  ) {
    const msg = new KeyRingV2.FinalizeMnemonicKeyCoinTypeMsg(
      vaultId,
      chainId,
      coinType
    );
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

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
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

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");

    return result.vaultId;
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

  @flow
  *changeKeyRingName(vaultId: string, name: string) {
    const msg = new KeyRingV2.ChangeKeyRingNameMsg(vaultId, name);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    this.eventDispatcher.dispatchEvent("keplr_keystorechange");
  }

  @flow
  *deleteKeyRing(vaultId: string, password: string) {
    const msg = new KeyRingV2.DeleteKeyRingMsg(vaultId, password);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this._status = result.status;
    this._keyInfos = result.keyInfos;

    if (result.wasSelected && result.status === "unlocked") {
      this.eventDispatcher.dispatchEvent("keplr_keystorechange");
    }
  }
}
