import { Key, KeyRing, KeyRingStatus } from "./keyring";

import {
  NativeChainInfos,
  ChainInfo,
  ExtensionAccessOrigins,
  AccessOrigin
} from "../../chain-info";
import { Address } from "@everett-protocol/cosmosjs/crypto";
import { AsyncApprover } from "../../common/async-approver";

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
  private readonly keyRing = new KeyRing();
  private path = "";

  private readonly signApprover = new AsyncApprover();
  private readonly signMessages: Map<string, SignMessage> = new Map();

  getRegisteredChains(): ChainInfo[] {
    return NativeChainInfos;
  }

  getChainInfo(chainId: string): ChainInfo {
    const chainInfo = this.getRegisteredChains().find(chainInfo => {
      return chainInfo.chainId === chainId;
    });

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chainInfo;
  }

  getAccessOrigins(): AccessOrigin[] {
    return ExtensionAccessOrigins;
  }

  getAccessOrigin(chainId: string): string[] {
    const accessOrigins = this.getAccessOrigins();
    const accessOrigin = accessOrigins.find(accessOrigin => {
      return (accessOrigin.chainId = chainId);
    });

    if (!accessOrigin) {
      throw new Error(`There is no access origins for ${chainId}`);
    }

    return accessOrigin.origins;
  }

  checkAccessOrigin(chainId: string, origin: string) {
    if (origin === `chrome-extension://${chrome.runtime.id}`) {
      return;
    }

    const accessOrigin = this.getAccessOrigin(chainId);
    if (accessOrigin.indexOf(origin) <= -1) {
      throw new Error("This origin is not approved");
    }
  }

  async checkBech32Address(chainId: string, bech32Address: string) {
    const key = await this.getKey();
    if (
      bech32Address !==
      new Address(key.address).toBech32(
        this.getChainInfo(chainId).bech32Config.bech32PrefixAccAddr
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

  async createKey(mnemonic: string, password: string): Promise<KeyRingStatus> {
    // TODO: Check mnemonic checksum.
    await this.keyRing.createKey(mnemonic, password);
    return this.keyRing.status;
  }

  async unlock(password: string): Promise<KeyRingStatus> {
    await this.keyRing.unlock(password);
    return this.keyRing.status;
  }

  setPath(chainId: string, account: number, index: number) {
    this.path = this.getChainInfo(chainId).bip44.pathString(account, index);
  }

  async getKey(): Promise<Key> {
    if (!this.path) {
      throw new Error("path not set");
    }

    return this.keyRing.getKey(this.path);
  }

  async requestSign(
    chainId: string,
    message: Uint8Array,
    index: string,
    openPopup: boolean
  ): Promise<Uint8Array> {
    this.signMessages.set(index, { chainId, message });

    if (openPopup) {
      window.open(
        `chrome-extension://${chrome.runtime.id}/popup.html#/sign/${index}`,
        "sign",
        "width=360px,height=600px",
        true
      );
    }

    await this.signApprover.reject(index);
    this.signMessages.delete(index);
    return this.keyRing.sign(this.path, message);
  }

  getRequestedMessage(index: string): SignMessage {
    const message = this.signMessages.get(index);
    if (!message) {
      throw new Error("Unknown sign request index");
    }

    return message;
  }

  approveSign(index: string): void {
    this.signApprover.approve(index);
  }

  rejectSign(index: string): void {
    this.signApprover.reject(index);
  }
}
