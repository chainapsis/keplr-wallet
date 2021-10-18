import { Crypto, KeyStore } from "./crypto";
import {
  Mnemonic,
  PrivKeySecp256k1,
  PubKeySecp256k1,
  RNG,
} from "@keplr-wallet/crypto";
import { KVStore } from "@keplr-wallet/common";
import { LedgerService } from "../ledger";
import { BIP44HDPath, CommonCrypto, ExportKeyRingData } from "./types";
import { ChainInfo } from "@keplr-wallet/types";
import { Env } from "@keplr-wallet/router";

import { Buffer } from "buffer/";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export enum KeyRingStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}

export interface Key {
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  isNanoLedger: boolean;
}

export type MultiKeyStoreInfoElem = Pick<
  KeyStore,
  "version" | "type" | "meta" | "bip44HDPath" | "coinTypeForChain"
>;
export type MultiKeyStoreInfo = MultiKeyStoreInfoElem[];
export type MultiKeyStoreInfoWithSelectedElem = MultiKeyStoreInfoElem & {
  selected: boolean;
};
export type MultiKeyStoreInfoWithSelected = MultiKeyStoreInfoWithSelectedElem[];

const KeyStoreKey = "key-store";
const KeyMultiStoreKey = "key-multi-store";

/*
 Keyring stores keys in persistent backround.
 And, this manages the state, crypto, address, signing and so on...
 */
export class KeyRing {
  private cached: Map<string, Uint8Array> = new Map();

  private loaded: boolean;

  /**
   * Keyring can have either private key or mnemonic.
   * If keyring has private key, it can't set the BIP 44 path.
   */
  private _privateKey?: Uint8Array;
  private _mnemonic?: string;
  private _ledgerPublicKey?: Uint8Array;

  private keyStore: KeyStore | null;

  private multiKeyStore: KeyStore[];

  private password: string = "";

  constructor(
    private readonly embedChainInfos: ChainInfo[],
    private readonly kvStore: KVStore,
    private readonly ledgerKeeper: LedgerService,
    private readonly rng: RNG,
    private readonly crypto: CommonCrypto
  ) {
    this.loaded = false;
    this.keyStore = null;
    this.multiKeyStore = [];
  }

  public static getTypeOfKeyStore(
    keyStore: Omit<KeyStore, "crypto">
  ): "mnemonic" | "privateKey" | "ledger" {
    const type = keyStore.type;
    if (type == null) {
      return "mnemonic";
    }

    if (type !== "mnemonic" && type !== "privateKey" && type !== "ledger") {
      throw new Error("Invalid type of key store");
    }

    return type;
  }

  public get type(): "mnemonic" | "privateKey" | "ledger" | "none" {
    if (!this.keyStore) {
      return "none";
    } else {
      return KeyRing.getTypeOfKeyStore(this.keyStore);
    }
  }

  public isLocked(): boolean {
    return (
      this.privateKey == null &&
      this.mnemonic == null &&
      this.ledgerPublicKey == null
    );
  }

  private get privateKey(): Uint8Array | undefined {
    return this._privateKey;
  }

  private set privateKey(privateKey: Uint8Array | undefined) {
    this._privateKey = privateKey;
    this._mnemonic = undefined;
    this._ledgerPublicKey = undefined;
    this.cached = new Map();
  }

  private get mnemonic(): string | undefined {
    return this._mnemonic;
  }

  private set mnemonic(mnemonic: string | undefined) {
    this._mnemonic = mnemonic;
    this._privateKey = undefined;
    this._ledgerPublicKey = undefined;
    this.cached = new Map();
  }

  private get ledgerPublicKey(): Uint8Array | undefined {
    return this._ledgerPublicKey;
  }

  private set ledgerPublicKey(publicKey: Uint8Array | undefined) {
    this._mnemonic = undefined;
    this._privateKey = undefined;
    this._ledgerPublicKey = publicKey;
    this.cached = new Map();
  }

  public get status(): KeyRingStatus {
    if (!this.loaded) {
      return KeyRingStatus.NOTLOADED;
    }

    if (!this.keyStore) {
      return KeyRingStatus.EMPTY;
    } else if (!this.isLocked()) {
      return KeyRingStatus.UNLOCKED;
    } else {
      return KeyRingStatus.LOCKED;
    }
  }

  public getKeyStoreCoinType(chainId: string): number | undefined {
    if (!this.keyStore) {
      return undefined;
    }

    if (!this.keyStore.coinTypeForChain) {
      return undefined;
    }

    return this.keyStore.coinTypeForChain[
      ChainIdHelper.parse(chainId).identifier
    ];
  }

  public getKey(chainId: string, defaultCoinType: number): Key {
    return this.loadKey(this.computeKeyStoreCoinType(chainId, defaultCoinType));
  }

  public getKeyStoreMeta(key: string): string {
    if (!this.keyStore || this.keyStore.meta == null) {
      return "";
    }

    return this.keyStore.meta[key] ?? "";
  }

  private computeKeyStoreCoinType(
    chainId: string,
    defaultCoinType: number
  ): number {
    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    return this.keyStore.coinTypeForChain
      ? this.keyStore.coinTypeForChain[
          ChainIdHelper.parse(chainId).identifier
        ] ?? defaultCoinType
      : defaultCoinType;
  }

  public getKeyFromCoinType(coinType: number): Key {
    return this.loadKey(coinType);
  }

  public async createMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    this.mnemonic = mnemonic;
    this.keyStore = await KeyRing.CreateMnemonicKeyStore(
      this.rng,
      this.crypto,
      kdf,
      mnemonic,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public async createPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    this.privateKey = privateKey;
    this.keyStore = await KeyRing.CreatePrivateKeyStore(
      this.rng,
      this.crypto,
      kdf,
      privateKey,
      password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.password = password;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public async createLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    status: KeyRingStatus;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.EMPTY) {
      throw new Error("Key ring is not loaded or not empty");
    }

    // Get public key first
    this.ledgerPublicKey = await this.ledgerKeeper.getPublicKey(
      env,
      bip44HDPath
    );

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      this.rng,
      this.crypto,
      kdf,
      this.ledgerPublicKey,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );

    this.password = password;
    this.keyStore = keyStore;
    this.multiKeyStore.push(this.keyStore);

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: await this.getMultiKeyStoreInfo(),
    };
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    this.mnemonic = undefined;
    this.privateKey = undefined;
    this.ledgerPublicKey = undefined;
    this.password = "";
  }

  public async unlock(password: string) {
    if (!this.keyStore || this.type === "none") {
      throw new Error("Key ring not initialized");
    }

    if (this.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      this.mnemonic = Buffer.from(
        await Crypto.decrypt(this.crypto, this.keyStore, password)
      ).toString();
    } else if (this.type === "privateKey") {
      // If password is invalid, error will be thrown.
      this.privateKey = Buffer.from(
        Buffer.from(
          await Crypto.decrypt(this.crypto, this.keyStore, password)
        ).toString(),
        "hex"
      );
    } else if (this.type === "ledger") {
      this.ledgerPublicKey = Buffer.from(
        Buffer.from(
          await Crypto.decrypt(this.crypto, this.keyStore, password)
        ).toString(),
        "hex"
      );
    } else {
      throw new Error("Unexpected type of keyring");
    }

    this.password = password;
  }

  public async save() {
    await this.kvStore.set<KeyStore>(KeyStoreKey, this.keyStore);
    await this.kvStore.set<KeyStore[]>(KeyMultiStoreKey, this.multiKeyStore);
  }

  public async restore() {
    const keyStore = await this.kvStore.get<KeyStore>(KeyStoreKey);
    if (!keyStore) {
      this.keyStore = null;
    } else {
      this.keyStore = keyStore;
    }
    const multiKeyStore = await this.kvStore.get<KeyStore[]>(KeyMultiStoreKey);
    if (!multiKeyStore) {
      // Restore the multi keystore if key store exist but multi key store is empty.
      // This case will occur if extension is updated from the prior version that doesn't support the multi key store.
      // This line ensures the backward compatibility.
      if (keyStore) {
        keyStore.meta = await this.assignKeyStoreIdMeta({});
        this.multiKeyStore = [keyStore];
      } else {
        this.multiKeyStore = [];
      }
      await this.save();
    } else {
      this.multiKeyStore = multiKeyStore;
    }

    let hasLegacyKeyStore = false;
    // In prior of version 1.2, bip44 path didn't tie with the keystore, and bip44 exists on the chain info.
    // But, after some chain matures, they decided the bip44 path's coin type.
    // So, some chain can have the multiple bip44 coin type (one is the standard coin type and other is the legacy coin type).
    // We should support the legacy coin type, so we determined that the coin type ties with the keystore.
    // To decrease the barrier of existing users, set the alternative coin type by force if the keystore version is prior than 1.2.
    if (this.keyStore) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this.keyStore.version === "1" || this.keyStore.version === "1.1") {
        hasLegacyKeyStore = true;
        this.updateLegacyKeyStore(this.keyStore);
      }
    }
    for (const keyStore of this.multiKeyStore) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (keyStore.version === "1" || keyStore.version === "1.1") {
        hasLegacyKeyStore = true;
        this.updateLegacyKeyStore(keyStore);
      }
    }
    if (hasLegacyKeyStore) {
      await this.save();
    }

    this.loaded = true;
  }

  private updateLegacyKeyStore(keyStore: KeyStore) {
    keyStore.version = "1.2";
    for (const chainInfo of this.embedChainInfos) {
      const coinType = (() => {
        if (
          chainInfo.alternativeBIP44s &&
          chainInfo.alternativeBIP44s.length > 0
        ) {
          return chainInfo.alternativeBIP44s[0].coinType;
        } else {
          return chainInfo.bip44.coinType;
        }
      })();
      keyStore.coinTypeForChain = {
        ...keyStore.coinTypeForChain,
        [ChainIdHelper.parse(chainInfo.chainId).identifier]: coinType,
      };
    }
  }

  public isKeyStoreCoinTypeSet(chainId: string): boolean {
    if (!this.keyStore) {
      throw new Error("Empty key store");
    }

    return (
      this.keyStore.coinTypeForChain &&
      this.keyStore.coinTypeForChain[
        ChainIdHelper.parse(chainId).identifier
      ] !== undefined
    );
  }

  public async setKeyStoreCoinType(chainId: string, coinType: number) {
    if (!this.keyStore) {
      throw new Error("Empty key store");
    }

    if (
      this.keyStore.coinTypeForChain &&
      this.keyStore.coinTypeForChain[
        ChainIdHelper.parse(chainId).identifier
      ] !== undefined
    ) {
      throw new Error("Coin type already set");
    }

    this.keyStore.coinTypeForChain = {
      ...this.keyStore.coinTypeForChain,
      [ChainIdHelper.parse(chainId).identifier]: coinType,
    };

    const keyStoreInMulti = this.multiKeyStore.find((keyStore) => {
      return (
        KeyRing.getKeyStoreId(keyStore) ===
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        KeyRing.getKeyStoreId(this.keyStore!)
      );
    });

    if (keyStoreInMulti) {
      keyStoreInMulti.coinTypeForChain = {
        ...this.keyStore.coinTypeForChain,
      };
    }

    await this.save();
  }

  public async deleteKeyRing(
    index: number,
    password: string
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    const multiKeyStore = this.multiKeyStore
      .slice(0, index)
      .concat(this.multiKeyStore.slice(index + 1));

    // Make sure that password is valid.
    await Crypto.decrypt(this.crypto, keyStore, password);

    if (this.keyStore) {
      // If key store is currently selected key store
      if (
        KeyRing.getKeyStoreId(keyStore) === KeyRing.getKeyStoreId(this.keyStore)
      ) {
        // If there is a key store left
        if (multiKeyStore.length > 0) {
          // Lock key store at first
          await this.lock();
          // Select first key store
          this.keyStore = multiKeyStore[0];
          // And unlock it
          await this.unlock(password);
        } else {
          // Else clear keyring.
          this.keyStore = null;
          this.mnemonic = undefined;
          this.privateKey = undefined;
        }
      }
    }

    this.multiKeyStore = multiKeyStore;
    await this.save();
    return this.getMultiKeyStoreInfo();
  }

  public async updateNameKeyRing(
    index: number,
    name: string
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    keyStore.meta = { ...keyStore.meta, name: name };

    // If select key store and changed store are same, sync keystore
    if (
      this.keyStore &&
      KeyRing.getKeyStoreId(this.keyStore) === KeyRing.getKeyStoreId(keyStore)
    ) {
      this.keyStore = keyStore;
    }
    await this.save();
    return this.getMultiKeyStoreInfo();
  }

  private loadKey(coinType: number): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    if (this.keyStore.type === "ledger") {
      if (!this.ledgerPublicKey) {
        throw new Error("Ledger public key not set");
      }

      const pubKey = new PubKeySecp256k1(this.ledgerPublicKey);

      return {
        algo: "secp256k1",
        pubKey: pubKey.toBytes(),
        address: pubKey.getAddress(),
        isNanoLedger: true,
      };
    } else {
      const privKey = this.loadPrivKey(coinType);
      const pubKey = privKey.getPubKey();

      return {
        algo: "secp256k1",
        pubKey: pubKey.toBytes(),
        address: pubKey.getAddress(),
        isNanoLedger: false,
      };
    }
  }

  private loadPrivKey(coinType: number): PrivKeySecp256k1 {
    if (
      this.status !== KeyRingStatus.UNLOCKED ||
      this.type === "none" ||
      !this.keyStore
    ) {
      throw new Error("Key ring is not unlocked");
    }

    const bip44HDPath = KeyRing.getKeyStoreBIP44Path(this.keyStore);

    if (this.type === "mnemonic") {
      const path = `m/44'/${coinType}'/${bip44HDPath.account}'/${bip44HDPath.change}/${bip44HDPath.addressIndex}`;
      const cachedKey = this.cached.get(path);
      if (cachedKey) {
        return new PrivKeySecp256k1(cachedKey);
      }

      if (!this.mnemonic) {
        throw new Error(
          "Key store type is mnemonic and it is unlocked. But, mnemonic is not loaded unexpectedly"
        );
      }

      const privKey = Mnemonic.generateWalletFromMnemonic(this.mnemonic, path);

      this.cached.set(path, privKey);
      return new PrivKeySecp256k1(privKey);
    } else if (this.type === "privateKey") {
      // If key store type is private key, path will be ignored.

      if (!this.privateKey) {
        throw new Error(
          "Key store type is private key and it is unlocked. But, private key is not loaded unexpectedly"
        );
      }

      return new PrivKeySecp256k1(this.privateKey);
    } else {
      throw new Error("Unexpected type of keyring");
    }
  }

  public async sign(
    env: Env,
    chainId: string,
    defaultCoinType: number,
    message: Uint8Array
  ): Promise<Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new Error("Key Store is empty");
    }

    if (this.keyStore.type === "ledger") {
      const pubKey = this.ledgerPublicKey;

      if (!pubKey) {
        throw new Error("Ledger public key is not initialized");
      }

      return await this.ledgerKeeper.sign(
        env,
        KeyRing.getKeyStoreBIP44Path(this.keyStore),
        pubKey,
        message
      );
    } else {
      const coinType = this.computeKeyStoreCoinType(chainId, defaultCoinType);

      const privKey = this.loadPrivKey(coinType);
      return privKey.sign(message);
    }
  }

  // Show private key or mnemonic key if password is valid.
  public async showKeyRing(index: number, password: string): Promise<string> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new Error("Empty key store");
    }

    if (keyStore.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      return Buffer.from(
        await Crypto.decrypt(this.crypto, keyStore, password)
      ).toString();
    } else {
      // If password is invalid, error will be thrown.
      return Buffer.from(
        await Crypto.decrypt(this.crypto, keyStore, password)
      ).toString();
    }
  }

  public get canSetPath(): boolean {
    return this.type === "mnemonic" || this.type === "ledger";
  }

  public async addMnemonicKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = await KeyRing.CreateMnemonicKeyStore(
      this.rng,
      this.crypto,
      kdf,
      mnemonic,
      this.password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );
    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public async addPrivateKey(
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = await KeyRing.CreatePrivateKeyStore(
      this.rng,
      this.crypto,
      kdf,
      privateKey,
      this.password,
      await this.assignKeyStoreIdMeta(meta)
    );
    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public async addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    // Get public key first
    const publicKey = await this.ledgerKeeper.getPublicKey(env, bip44HDPath);

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      this.rng,
      this.crypto,
      kdf,
      publicKey,
      this.password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );

    this.multiKeyStore.push(keyStore);

    await this.save();
    return {
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public async changeKeyStoreFromMultiKeyStore(
    index: number
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new Error("Key ring is locked or not initialized");
    }

    const keyStore = this.multiKeyStore[index];
    if (!keyStore) {
      throw new Error("Invalid keystore");
    }

    this.keyStore = keyStore;

    await this.unlock(this.password);

    await this.save();
    return {
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    const result: MultiKeyStoreInfoWithSelected = [];

    for (const keyStore of this.multiKeyStore) {
      result.push({
        version: keyStore.version,
        type: keyStore.type,
        meta: keyStore.meta,
        coinTypeForChain: keyStore.coinTypeForChain,
        bip44HDPath: keyStore.bip44HDPath,
        selected: this.keyStore
          ? KeyRing.getKeyStoreId(keyStore) ===
            KeyRing.getKeyStoreId(this.keyStore)
          : false,
      });
    }

    return result;
  }

  checkPassword(password: string): boolean {
    if (!this.password) {
      throw new Error("Keyring is locked");
    }

    return this.password === password;
  }

  async exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    if (!this.password) {
      throw new Error("Keyring is locked");
    }

    if (this.password !== password) {
      throw new Error("Invalid password");
    }

    const result: ExportKeyRingData[] = [];

    for (const keyStore of this.multiKeyStore) {
      const type = keyStore.type ?? "mnemonic";

      switch (type) {
        case "mnemonic": {
          const mnemonic = Buffer.from(
            await Crypto.decrypt(this.crypto, keyStore, password)
          ).toString();

          result.push({
            bip44HDPath: keyStore.bip44HDPath ?? {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            coinTypeForChain: keyStore.coinTypeForChain,
            key: mnemonic,
            meta: keyStore.meta ?? {},
            type: "mnemonic",
          });

          break;
        }
        case "privateKey": {
          const privateKey = Buffer.from(
            await Crypto.decrypt(this.crypto, keyStore, password)
          ).toString();

          result.push({
            bip44HDPath: keyStore.bip44HDPath ?? {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            coinTypeForChain: keyStore.coinTypeForChain,
            key: privateKey,
            meta: keyStore.meta ?? {},
            type: "privateKey",
          });

          break;
        }
      }
    }

    return result;
  }

  private static async CreateMnemonicKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      "mnemonic",
      mnemonic,
      password,
      meta,
      bip44HDPath
    );
  }

  private static async CreatePrivateKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      "privateKey",
      Buffer.from(privateKey).toString("hex"),
      password,
      meta
    );
  }

  private static async CreateLedgerKeyStore(
    rng: RNG,
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    publicKey: Uint8Array,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      rng,
      crypto,
      kdf,
      "ledger",
      Buffer.from(publicKey).toString("hex"),
      password,
      meta,
      bip44HDPath
    );
  }

  private async assignKeyStoreIdMeta(meta: {
    [key: string]: string;
  }): Promise<{
    [key: string]: string;
  }> {
    // `__id__` is used to distinguish the key store.
    return Object.assign({}, meta, {
      __id__: (await this.getIncrementalNumber()).toString(),
    });
  }

  private static getKeyStoreId(keyStore: KeyStore): string {
    const id = keyStore.meta?.__id__;
    if (!id) {
      throw new Error("Key store's id is empty");
    }

    return id;
  }

  private static getKeyStoreBIP44Path(keyStore: KeyStore): BIP44HDPath {
    if (!keyStore.bip44HDPath) {
      return {
        account: 0,
        change: 0,
        addressIndex: 0,
      };
    }
    KeyRing.validateBIP44Path(keyStore.bip44HDPath);
    return keyStore.bip44HDPath;
  }

  public static validateBIP44Path(bip44Path: BIP44HDPath): void {
    if (!Number.isInteger(bip44Path.account) || bip44Path.account < 0) {
      throw new Error("Invalid account in hd path");
    }

    if (
      !Number.isInteger(bip44Path.change) ||
      !(bip44Path.change === 0 || bip44Path.change === 1)
    ) {
      throw new Error("Invalid change in hd path");
    }

    if (
      !Number.isInteger(bip44Path.addressIndex) ||
      bip44Path.addressIndex < 0
    ) {
      throw new Error("Invalid address index in hd path");
    }
  }

  private async getIncrementalNumber(): Promise<number> {
    let num = await this.kvStore.get<number>("incrementalNumber");
    if (num === undefined) {
      num = 0;
    }
    num++;

    await this.kvStore.set("incrementalNumber", num);
    return num;
  }
}
