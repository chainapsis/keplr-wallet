import { Key, KeyRing, KeyRingStatus } from "./keyring";

export interface KeyHex {
  algo: string;
  pubKeyHex: string;
  addressHex: string;
  bech32Address: string;
}

interface SignApproval {
  approve: boolean;
}

export class KeyRingKeeper {
  private readonly keyRing = new KeyRing();
  private path = "";

  private readonly signRequests: Map<
    string,
    { resolve: (value: SignApproval) => void; reject: (reason?: any) => void }
  > = new Map();
  private readonly signMessages: Map<string, Uint8Array> = new Map();

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

  setPath(path: string) {
    this.path = path;
  }

  async getKey(): Promise<Key> {
    if (!this.path) {
      throw new Error("path not set");
    }

    return this.keyRing.getKey(this.path);
  }

  async requestSign(message: Uint8Array, index: string): Promise<Uint8Array> {
    KeyRingKeeper.isValidIndex(index);

    if (this.signRequests.has(index) || this.signMessages.has(index)) {
      throw new Error("index exists");
    }

    const promise = new Promise<SignApproval>((resolve, reject) => {
      this.signRequests.set(index, {
        resolve,
        reject
      });
    });
    this.signMessages.set(index, message);

    const tempSignIndex = index;

    const approval = await promise;
    if (approval.approve) {
      this.signRequests.delete(tempSignIndex);
      this.signMessages.delete(tempSignIndex);
      return this.keyRing.sign(this.path, message);
    } else {
      this.signRequests.delete(tempSignIndex);
      this.signMessages.delete(tempSignIndex);
      throw new Error("Signature rejected");
    }
  }

  getRequestedMessage(index: string): Uint8Array {
    const message = this.signMessages.get(index);
    if (!message) {
      throw new Error("Unknown sign request index");
    }

    return message;
  }

  approveSign(index: string): void {
    const resolver = this.signRequests.get(index);
    if (!resolver) {
      throw new Error("Unknown sign request index");
    }

    resolver.resolve({ approve: true });
  }

  rejectSign(index: string): void {
    const resolver = this.signRequests.get(index);
    if (!resolver) {
      throw new Error("Unknown sign request index");
    }

    resolver.resolve({ approve: false });
  }

  private static isValidIndex(index: string) {
    if (!index || index.length < 4) {
      throw new Error("Too short index");
    }

    if (index.length > 8) {
      throw new Error("Too long index");
    }
  }
}
