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
  ClearKeyRingMsg
} from "../../../../background/keyring";

import { action, observable } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { RootStore } from "../root";

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

  constructor(private rootStore: RootStore) {
    this.setStatus(KeyRingStatus.NOTLOADED);
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

  @actionAsync
  public async createMnemonicKey(mnemonic: string, password: string) {
    const msg = new CreateMnemonicKeyMsg(mnemonic, password);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
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
  }

  @actionAsync
  public async save() {
    const msg = new SaveKeyRingMsg();
    await task(sendMessage(BACKGROUND_PORT, msg));
  }

  /**
   * Clear key ring data.
   * This will throw unless you are in a development env.
   */
  @actionAsync
  public async clear() {
    if (process.env.NODE_ENV !== "development") {
      throw new Error(
        "do not use the clear function unless you are in a development environment"
      );
    }

    const msg = new ClearKeyRingMsg();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setStatus(result.status);
  }
}
