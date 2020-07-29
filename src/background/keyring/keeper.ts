import { Key, KeyRing, KeyRingStatus } from "./keyring";

import { Address } from "@everett-protocol/cosmosjs/crypto";
import { AsyncApprover } from "../../common/async-approver";
import {
  TxBuilderConfigPrimitive,
  TxBuilderConfigPrimitiveWithChainId
} from "./types";

import { KVStore } from "../../common/kvstore";

import { ChainsKeeper } from "../chains/keeper";

export interface KeyHex {
  algo: string;
  pubKeyHex: string;
  addressHex: string;
  bech32Address: string;
}

interface SignMessage {
  chainId: string;
  message: Uint8Array;
}

export class KeyRingKeeper {
  private readonly keyRing: KeyRing;
  private path = "";

  private readonly unlockApprover: AsyncApprover;

  private readonly txBuilderApprover: AsyncApprover<
    TxBuilderConfigPrimitiveWithChainId,
    TxBuilderConfigPrimitive
  >;

  private readonly signApprover: AsyncApprover<SignMessage>;

  constructor(
    kvStore: KVStore,
    public readonly chainsKeeper: ChainsKeeper,
    private readonly windowOpener: (url: string) => void,
    approverTimeout: number | undefined = undefined
  ) {
    this.keyRing = new KeyRing(kvStore);

    this.unlockApprover = new AsyncApprover({
      defaultTimeout: approverTimeout != null ? approverTimeout : 3 * 60 * 1000
    });
    this.txBuilderApprover = new AsyncApprover<
      TxBuilderConfigPrimitiveWithChainId,
      TxBuilderConfigPrimitive
    >({
      defaultTimeout: approverTimeout != null ? approverTimeout : 3 * 60 * 1000
    });
    this.signApprover = new AsyncApprover<SignMessage>({
      defaultTimeout: approverTimeout != null ? approverTimeout : 3 * 60 * 1000
    });
  }

  async enable(extensionBaseURL: string): Promise<KeyRingStatus> {
    if (this.keyRing.status === KeyRingStatus.EMPTY) {
      throw new Error("key doesn't exist");
    }

    if (this.keyRing.status === KeyRingStatus.NOTLOADED) {
      await this.keyRing.restore();
    }

    if (this.keyRing.status === KeyRingStatus.LOCKED) {
      this.windowOpener(`${extensionBaseURL}popup.html#/?external=true`);
      await this.unlockApprover.request("unlock");
      return this.keyRing.status;
    }

    return this.keyRing.status;
  }

  async checkAccessOrigin(
    extensionBaseURL: string,
    chainId: string,
    origin: string
  ) {
    await this.chainsKeeper.checkAccessOrigin(
      extensionBaseURL,
      chainId,
      origin
    );
  }

  async checkBech32Address(chainId: string, bech32Address: string) {
    const key = await this.getKey();
    if (
      bech32Address !==
      new Address(key.address).toBech32(
        (await this.chainsKeeper.getChainInfo(chainId)).bech32Config
          .bech32PrefixAccAddr
      )
    ) {
      throw new Error("Invalid bech32 address");
    }
  }

  async restore(): Promise<KeyRingStatus> {
    await this.keyRing.restore();
    return this.keyRing.status;
  }

  async save(): Promise<void> {
    await this.keyRing.save();
  }

  /**
   * This will clear all key ring data.
   */
  async clear(password: string): Promise<KeyRingStatus> {
    await this.keyRing.clear(password);
    return this.keyRing.status;
  }

  async showKeyRing(password: string): Promise<string> {
    return await this.keyRing.showKeyRing(password);
  }

  async createMnemonicKey(
    mnemonic: string,
    password: string
  ): Promise<KeyRingStatus> {
    // TODO: Check mnemonic checksum.
    await this.keyRing.createMnemonicKey(mnemonic, password);
    return this.keyRing.status;
  }

  async createPrivateKey(
    privateKey: Uint8Array,
    password: string
  ): Promise<KeyRingStatus> {
    // TODO: Check mnemonic checksum.
    await this.keyRing.createPrivateKey(privateKey, password);
    return this.keyRing.status;
  }

  lock(): KeyRingStatus {
    this.keyRing.lock();
    return this.keyRing.status;
  }

  async unlock(password: string): Promise<KeyRingStatus> {
    await this.keyRing.unlock(password);
    try {
      this.unlockApprover.approve("unlock");
    } catch {
      // noop
    }

    return this.keyRing.status;
  }

  async setPath(chainId: string, account: number, index: number) {
    this.path = (
      await this.chainsKeeper.getChainInfo(chainId)
    ).bip44.pathString(account, index);
  }

  async getKey(): Promise<Key> {
    if (!this.path) {
      throw new Error("path not set");
    }

    return this.keyRing.getKey(this.path);
  }

  async requestTxBuilderConfig(
    extensionBaseURL: string,
    config: TxBuilderConfigPrimitiveWithChainId,
    id: string,
    openPopup: boolean,
    skipApprove: boolean
  ): Promise<TxBuilderConfigPrimitive> {
    if (skipApprove) {
      return config;
    }

    if (openPopup) {
      this.windowOpener(
        `${extensionBaseURL}popup.html#/fee/${id}?external=true`
      );
    }

    const result = await this.txBuilderApprover.request(id, config);
    if (!result) {
      throw new Error("config is approved, but result config is null");
    }
    return result;
  }

  getRequestedTxConfig(id: string): TxBuilderConfigPrimitiveWithChainId {
    const config = this.txBuilderApprover.getData(id);
    if (!config) {
      throw new Error("Unknown config request id");
    }

    return config;
  }

  approveTxBuilderConfig(id: string, config: TxBuilderConfigPrimitive) {
    this.txBuilderApprover.approve(id, config);
  }

  rejectTxBuilderConfig(id: string): void {
    this.txBuilderApprover.reject(id);
  }

  getKeyRingType(): string {
    return this.keyRing.type;
  }

  async requestSign(
    extensionBaseURL: string,
    chainId: string,
    message: Uint8Array,
    id: string,
    openPopup: boolean,
    skipApprove: boolean
  ): Promise<Uint8Array> {
    if (skipApprove) {
      return this.keyRing.sign(this.path, message);
    }

    if (openPopup) {
      this.windowOpener(
        `${extensionBaseURL}popup.html#/sign/${id}?external=true`
      );
    }

    await this.signApprover.request(id, { chainId, message });
    return this.keyRing.sign(this.path, message);
  }

  getRequestedMessage(id: string): SignMessage {
    const message = this.signApprover.getData(id);
    if (!message) {
      throw new Error("Unknown sign request id");
    }

    return message;
  }

  approveSign(id: string): void {
    this.signApprover.approve(id);
  }

  rejectSign(id: string): void {
    this.signApprover.reject(id);
  }
}
