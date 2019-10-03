import { generateSeed } from "@everett-protocol/cosmosjs/utils/key";

import { ChainInfo } from "../chain";

import { sendMessage } from "../../../common/message";
import {
  KeyRingStatus,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  UnlockKeyRingMsg
} from "../../../background/keyring/export";

import { action, observable, flow } from "mobx";
import { BACKGROUND_PORT } from "../../../common/message/constant";

/*
 Actual key ring logic is managed in persistent background. Refer "src/common/message" and "src/background/keyring"
 This store only interact with key ring in persistent background.
 */

export class KeyRingStore {
  public static GenereateMnemonic(): string {
    return generateSeed(array => {
      return crypto.getRandomValues(array);
    }, 128);
  }

  @observable
  // disable never read error temporarily.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  private chainInfo!: ChainInfo;

  @observable
  public status!: KeyRingStatus;

  constructor() {
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
  }

  @action
  public createKey = flow(function*(
    this: KeyRingStore,
    mnemonic: string,
    password: string
  ) {
    const msg = CreateKeyMsg.create(mnemonic, password);
    const result = yield sendMessage(BACKGROUND_PORT, msg);
    this.setStatus(result.status);
  });

  @action
  public unlock = flow(function*(this: KeyRingStore, password: string) {
    const msg = UnlockKeyRingMsg.create(password);
    const result = yield sendMessage(BACKGROUND_PORT, msg);
    this.setStatus(result.status);
  });

  @action
  public restore = flow(function*(this: KeyRingStore) {
    const msg = RestoreKeyRingMsg.create();
    const result = yield sendMessage(BACKGROUND_PORT, msg);
    this.setStatus(result.status);
  });

  @action
  public save = flow(function*(this: KeyRingStore) {
    const msg = SaveKeyRingMsg.create();
    yield sendMessage(BACKGROUND_PORT, msg);
  });
}
