import { generateSeed } from "@everett-protocol/cosmosjs/utils/key";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

import { sendMessage } from "../../../common/message";
import {
  KeyRingStatus,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  GetBech32AddressMsg,
  CreateKeyMsg,
  UnlockKeyRingMsg
} from "../../../background/keyring/export";

import { action, observable, flow } from "mobx";
import { BACKGROUND_PORT } from "../../../common/message/constant";

export class KeyRingStore {
  public static GenereateMnemonic(): string {
    return generateSeed(array => {
      return crypto.getRandomValues(array);
    }, 128);
  }

  @observable
  public status!: KeyRingStatus;

  constructor() {
    this.setStatus(KeyRingStatus.NOTLOADED);
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

  public async bech32Address(bip44: BIP44, prefix: string): Promise<string> {
    const path = bip44.pathString(0, 0);
    const msg = GetBech32AddressMsg.create(path, prefix);
    const result = await sendMessage(BACKGROUND_PORT, msg);
    return result.bech32Address as string;
  }
}
