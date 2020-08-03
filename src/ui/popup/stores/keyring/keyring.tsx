import { generateSeed } from "@everett-protocol/cosmosjs/utils/key";

import { ChainInfo } from "../../../../background/chains";

import { sendMessage } from "../../../../common/message";
import {
  KeyRingStatus,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateMnemonicKeyMsg,
  UnlockKeyRingMsg,
  LockKeyRingMsg,
  ClearKeyRingMsg,
  CreatePrivateKeyMsg,
  GetKeyRingTypeMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg
} from "../../../../background/keyring";

import { action, observable } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { RootStore } from "../root";
import { MultiKeyStoreInfoWithSelected } from "../../../../background/keyring/keyring";

const Buffer = require("buffer/").Buffer;

/*
 Actual key ring logic is managed in persistent background. Refer "src/common/message" and "src/background/keyring"
 This store only interact with key ring in persistent background.
 */

export class KeyRingStore {
  public static GenereateMnemonic(strenth: number = 128): string {
    return generateSeed(array => {
      return crypto.getRandomValues(array);
    }, strenth);
  }

  @observable
  // disable never read error temporarily.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  private chainInfo!: ChainInfo;

  @observable
  public status!: KeyRingStatus;

  @observable
  public keyRingType!: string;

  @observable
  public multiKeyStoreInfo!: MultiKeyStoreInfoWithSelected;

  constructor(private rootStore: RootStore) {
    this.setKeyRingType("none");
    this.setStatus(KeyRingStatus.NOTLOADED);
    this.setMultiKeyStoreInfo([]);
  }

  @action
  private setKeyRingType(type: string) {
    this.keyRingType = type;
  }

  // This will be called by chain store.
  @action
  public setChainInfo(info: ChainInfo) {
    this.chainInfo = info;
  }

  @action
  private setStatus(status: KeyRingStatus) {
    this.status = status;
    this.rootStore.setKeyRingStatus(status);
  }

  @action
  private setMultiKeyStoreInfo(info: MultiKeyStoreInfoWithSelected) {
    this.multiKeyStoreInfo = info;
  }

  @actionAsync
  public async createMnemonicKey(
    mnemonic: string,
    password: string,
    meta: Record<string, string>
  ) {
    const msg = new CreateMnemonicKeyMsg(mnemonic, password, meta);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async createPrivateKey(
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ) {
    const msg = new CreatePrivateKeyMsg(
      Buffer.from(privateKey).toString("hex"),
      password,
      meta
    );
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async addMnemonicKey(mnemonic: string, meta: Record<string, string>) {
    const msg = new AddMnemonicKeyMsg(mnemonic, meta);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setMultiKeyStoreInfo(result);
  }

  @actionAsync
  public async addPrivateKey(
    privateKey: Uint8Array,
    meta: Record<string, string>
  ) {
    const msg = new AddPrivateKeyMsg(
      Buffer.from(privateKey).toString("hex"),
      meta
    );
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setMultiKeyStoreInfo(result);
  }

  @actionAsync
  public async changeKeyRing(index: number) {
    const msg = new ChangeKeyRingMsg(index);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setMultiKeyStoreInfo(result);
    this.rootStore.changeKeyRing();
  }

  @actionAsync
  public async lock() {
    const msg = new LockKeyRingMsg();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async unlock(password: string) {
    const msg = new UnlockKeyRingMsg(password);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }

  @actionAsync
  public async restore() {
    const msg = new RestoreKeyRingMsg();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);

    const type = await task(
      sendMessage(BACKGROUND_PORT, new GetKeyRingTypeMsg())
    );
    this.setKeyRingType(type);

    const multiKeyStoreInfo = await task(
      sendMessage(BACKGROUND_PORT, new GetMultiKeyStoreInfoMsg())
    );
    this.setMultiKeyStoreInfo(multiKeyStoreInfo);
  }

  @actionAsync
  public async save() {
    const msg = new SaveKeyRingMsg();
    await task(sendMessage(BACKGROUND_PORT, msg));

    const type = await task(
      sendMessage(BACKGROUND_PORT, new GetKeyRingTypeMsg())
    );
    this.setKeyRingType(type);
  }

  /**
   * Clear key ring data.
   */
  @actionAsync
  public async clear(password: string) {
    const msg = new ClearKeyRingMsg(password);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);

    const type = await task(
      sendMessage(BACKGROUND_PORT, new GetKeyRingTypeMsg())
    );
    this.setKeyRingType(type);
  }
}
