import { Crypto, KeyStore } from "./crypto";
import {
  Hash,
  Mnemonic,
  PrivKeySecp256k1,
  PubKeySecp256k1,
} from "@keplr-wallet/crypto";
import { KVStore } from "@keplr-wallet/common";
import { LedgerApp, LedgerService } from "../ledger";
import { BIP44HDPath, CommonCrypto, ExportKeyRingData } from "./types";
import { ChainInfo, EthSignType } from "@keplr-wallet/types";
import { Env, KeplrError } from "@keplr-wallet/router";

import { Buffer } from "buffer/";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

import { Wallet } from "@ethersproject/wallet";
import * as BytesUtils from "@ethersproject/bytes";
import { computeAddress } from "@ethersproject/transactions";
import { EIP712MessageValidator } from "./eip712";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { KeystoneService } from "../keystone";

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
  isKeystone: boolean;
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
  private _mnemonicMasterSeed?: Uint8Array;
  private _ledgerPublicKeyCache?: Record<string, Uint8Array | undefined>;
  private _keystonePublicKeys?: Record<string, Uint8Array>;

  private keyStore: KeyStore | null;

  private multiKeyStore: KeyStore[];

  private password: string = "";

  constructor(
    private readonly embedChainInfos: ChainInfo[],
    private readonly kvStore: KVStore,
    private readonly ledgerKeeper: LedgerService,
    private readonly keystoneService: KeystoneService,
    private readonly crypto: CommonCrypto
  ) {
    this.loaded = false;
    this.keyStore = null;
    this.multiKeyStore = [];
  }

  public static getTypeOfKeyStore(
    keyStore: Omit<KeyStore, "crypto">
  ): "mnemonic" | "privateKey" | "ledger" | "keystone" {
    const type = keyStore.type;
    if (type == null) {
      return "mnemonic";
    }

    if (
      type !== "mnemonic" &&
      type !== "privateKey" &&
      type !== "ledger" &&
      type !== "keystone"
    ) {
      throw new KeplrError("keyring", 132, "Invalid type of key store");
    }

    return type;
  }

  public get type():
    | "mnemonic"
    | "privateKey"
    | "ledger"
    | "keystone"
    | "none" {
    if (!this.keyStore) {
      return "none";
    } else {
      return KeyRing.getTypeOfKeyStore(this.keyStore);
    }
  }

  public isLocked(): boolean {
    return (
      this.privateKey == null &&
      this.mnemonicMasterSeed == null &&
      this.ledgerPublicKeyCache == null &&
      this.keystonePublicKeys == null
    );
  }

  private get privateKey(): Uint8Array | undefined {
    return this._privateKey;
  }

  private set privateKey(privateKey: Uint8Array | undefined) {
    this._privateKey = privateKey;
    this._mnemonicMasterSeed = undefined;
    this._ledgerPublicKeyCache = undefined;
    this._keystonePublicKeys = undefined;
    this.cached = new Map();
  }

  private get mnemonicMasterSeed(): Uint8Array | undefined {
    return this._mnemonicMasterSeed;
  }

  private set mnemonicMasterSeed(masterSeed: Uint8Array | undefined) {
    this._mnemonicMasterSeed = masterSeed;
    this._privateKey = undefined;
    this._ledgerPublicKeyCache = undefined;
    this._keystonePublicKeys = undefined;
    this.cached = new Map();
  }

  private get keystonePublicKeys(): Record<string, Uint8Array> | undefined {
    return this._keystonePublicKeys;
  }

  private set keystonePublicKeys(
    publicKeys: Record<string, Uint8Array> | undefined
  ) {
    this._keystonePublicKeys = publicKeys;
    this._mnemonicMasterSeed = undefined;
    this._privateKey = undefined;
    this._ledgerPublicKeyCache = undefined;
    this.cached = new Map();
  }

  private get ledgerPublicKeyCache():
    | Record<string, Uint8Array | undefined>
    | undefined {
    return this._ledgerPublicKeyCache;
  }

  private set ledgerPublicKeyCache(
    publicKeys: Record<string, Uint8Array | undefined> | undefined
  ) {
    this._mnemonicMasterSeed = undefined;
    this._privateKey = undefined;
    this._ledgerPublicKeyCache = publicKeys;
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

  public getKey(
    chainId: string,
    defaultCoinType: number,
    useEthereumAddress: boolean
  ): Key {
    return this.loadKey(
      this.computeKeyStoreCoinType(chainId, defaultCoinType),
      useEthereumAddress
    );
  }

  public getKeyStoreMeta(key: string): string {
    if (!this.keyStore || this.keyStore.meta == null) {
      return "";
    }

    return this.keyStore.meta[key] ?? "";
  }

  public computeKeyStoreCoinType(
    chainId: string,
    defaultCoinType: number
  ): number {
    if (!this.keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
    }

    return this.keyStore.coinTypeForChain
      ? this.keyStore.coinTypeForChain[
          ChainIdHelper.parse(chainId).identifier
        ] ?? defaultCoinType
      : defaultCoinType;
  }

  public getKeyFromCoinType(
    coinType: number,
    useEthereumAddress: boolean
  ): Key {
    return this.loadKey(coinType, useEthereumAddress);
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
      throw new KeplrError(
        "keyring",
        142,
        "Key ring is not loaded or not empty"
      );
    }

    this.mnemonicMasterSeed = Mnemonic.generateMasterSeedFromMnemonic(mnemonic);
    this.keyStore = await KeyRing.CreateMnemonicKeyStore(
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
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
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
      throw new KeplrError(
        "keyring",
        142,
        "Key ring is not loaded or not empty"
      );
    }

    this.privateKey = privateKey;
    this.keyStore = await KeyRing.CreatePrivateKeyStore(
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
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public async createKeystoneKey(
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
      throw new KeplrError(
        "keyring",
        142,
        "Key ring is not loaded or not empty"
      );
    }

    // Get public key first
    const publicKey = await this.keystoneService.getPubkey(env, bip44HDPath);

    const pubKeys = {
      cosmos: publicKey,
    };

    const keyStore = await KeyRing.CreateKeystoneKeyStore(
      this.crypto,
      kdf,
      pubKeys,
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
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
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
      throw new KeplrError(
        "keyring",
        142,
        "Key ring is not loaded or not empty"
      );
    }

    // Get public key first
    const publicKey = await this.ledgerKeeper.getPublicKey(
      env,
      LedgerApp.Cosmos,
      bip44HDPath
    );

    const pubKeys = {
      [LedgerApp.Cosmos]: publicKey,
    };

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      this.crypto,
      kdf,
      pubKeys,
      password,
      await this.assignKeyStoreIdMeta(meta),
      bip44HDPath
    );

    this.password = password;
    this.keyStore = keyStore;
    this.multiKeyStore.push(this.keyStore);

    this.ledgerPublicKeyCache = pubKeys;

    await this.save();

    return {
      status: this.status,
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
    };
  }

  public lock() {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    this.mnemonicMasterSeed = undefined;
    this.privateKey = undefined;
    this.ledgerPublicKeyCache = undefined;
    this.password = "";
  }

  public async unlock(password: string) {
    if (!this.keyStore || this.type === "none") {
      throw new KeplrError("keyring", 144, "Key ring not initialized");
    }

    if (this.type === "mnemonic") {
      // If password is invalid, error will be thrown.
      this.mnemonicMasterSeed = Mnemonic.generateMasterSeedFromMnemonic(
        Buffer.from(
          await Crypto.decrypt(this.crypto, this.keyStore, password)
        ).toString()
      );
    } else if (this.type === "privateKey") {
      // If password is invalid, error will be thrown.
      this.privateKey = Buffer.from(
        Buffer.from(
          await Crypto.decrypt(this.crypto, this.keyStore, password)
        ).toString(),
        "hex"
      );
    } else if (this.type === "ledger") {
      // Attempt to decode the ciphertext as a JSON public key map. If that fails,
      // try decoding as a single public key hex.
      const pubKeys: Record<string, Uint8Array> = {};
      const cipherText = await Crypto.decrypt(
        this.crypto,
        this.keyStore,
        password
      );

      try {
        const encodedPubkeys = JSON.parse(Buffer.from(cipherText).toString());
        Object.keys(encodedPubkeys).forEach(
          (k) => (pubKeys[k] = Buffer.from(encodedPubkeys[k], "hex"))
        );
      } catch (e) {
        // Decode as bytes (Legacy representation)
        pubKeys[LedgerApp.Cosmos] = Buffer.from(
          Buffer.from(cipherText).toString(),
          "hex"
        );
      }

      this.ledgerPublicKeyCache = pubKeys;
    } else if (this.type === "keystone") {
      const cipherText = await Crypto.decrypt(
        this.crypto,
        this.keyStore,
        password
      );
      try {
        const keys = JSON.parse(Buffer.from(cipherText).toString());
        for (const k in keys) {
          keys[k] = Buffer.from(keys[k], "hex");
        }
        this.keystonePublicKeys = keys;
      } catch (e: any) {
        throw new KeplrError(
          "keyring",
          146,
          "Unexpected content of Keystone public keys"
        );
      }
    } else {
      throw new KeplrError("keyring", 145, "Unexpected type of keyring");
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
      // Restore the multi keystore if key store exist 13t multi Key store is empty.
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
      throw new KeplrError("keyring", 130, "Key store is empty");
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
      throw new KeplrError("keyring", 130, "Key store is empty");
    }

    if (
      this.keyStore.coinTypeForChain &&
      this.keyStore.coinTypeForChain[
        ChainIdHelper.parse(chainId).identifier
      ] !== undefined
    ) {
      throw new KeplrError("keyring", 110, "Coin type already set");
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

  public removeAllKeyStoreCoinType(chainId: string) {
    const identifier = ChainIdHelper.parse(chainId).identifier;

    if (this.keyStore) {
      const coinTypeForChain = this.keyStore.coinTypeForChain ?? {};
      delete coinTypeForChain[identifier];
      this.keyStore.coinTypeForChain = coinTypeForChain;
    }

    for (const keyStore of this.multiKeyStore) {
      const coinTypeForChain = keyStore.coinTypeForChain ?? {};
      delete coinTypeForChain[identifier];
      keyStore.coinTypeForChain = coinTypeForChain;
    }

    this.save();
  }

  public async deleteKeyRing(
    index: number,
    password: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
    keyStoreChanged: boolean;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new KeplrError("keyring", 121, "Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
    }

    const multiKeyStore = this.multiKeyStore
      .slice(0, index)
      .concat(this.multiKeyStore.slice(index + 1));

    // Make sure that password is valid.
    await Crypto.decrypt(this.crypto, keyStore, password);

    let keyStoreChanged = false;
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
          this.mnemonicMasterSeed = undefined;
          this.privateKey = undefined;
          this.ledgerPublicKeyCache = undefined;
        }

        keyStoreChanged = true;
      }
    }

    this.multiKeyStore = multiKeyStore;
    await this.save();
    return {
      multiKeyStoreInfo: this.getMultiKeyStoreInfo(),
      keyStoreChanged,
    };
  }

  public async updateNameKeyRing(
    index: number,
    name: string
  ): Promise<MultiKeyStoreInfoWithSelected> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
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

  private loadKey(coinType: number, useEthereumAddress: boolean = false): Key {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
    }

    if (this.keyStore.type === "ledger") {
      if (!this.ledgerPublicKeyCache) {
        throw new KeplrError("keyring", 150, "Ledger public key not set");
      }

      if (useEthereumAddress) {
        const pubKey = this.ensureLedgerPublicKey(LedgerApp.Ethereum);
        // Generate the Ethereum address for this public key
        const address = computeAddress(pubKey);

        return {
          algo: "ethsecp256k1",
          pubKey: pubKey,
          address: Buffer.from(address.replace("0x", ""), "hex"),
          isKeystone: false,
          isNanoLedger: true,
        };
      }

      const pubKey = new PubKeySecp256k1(
        this.ensureLedgerPublicKey(LedgerApp.Cosmos)
      );

      return {
        algo: "secp256k1",
        pubKey: pubKey.toBytes(),
        address: pubKey.getAddress(),
        isKeystone: false,
        isNanoLedger: true,
      };
    } else if (this.keyStore.type === "keystone") {
      if (!this.keystonePublicKeys) {
        throw new KeplrError("keyring", 160, "Keystone public key not set");
      }
      if (!this.keystonePublicKeys[coinType]) {
        throw new KeplrError("keyring", 161, "CoinType is not available");
      }
      const pubKey = new PubKeySecp256k1(this.keystonePublicKeys[coinType]);
      return {
        algo: "secp256k1",
        pubKey: pubKey.toBytes(),
        address: pubKey.getAddress(),
        isKeystone: true,
        isNanoLedger: false,
      };
    } else {
      const privKey = this.loadPrivKey(coinType);
      const pubKey = privKey.getPubKey();

      if (useEthereumAddress) {
        // For Ethereum Key-Gen Only:
        const wallet = new Wallet(privKey.toBytes());

        return {
          algo: "ethsecp256k1",
          pubKey: pubKey.toBytes(),
          address: Buffer.from(wallet.address.replace("0x", ""), "hex"),
          isKeystone: false,
          isNanoLedger: false,
        };
      }

      // Default
      return {
        algo: "secp256k1",
        pubKey: pubKey.toBytes(),
        address: pubKey.getAddress(),
        isKeystone: false,
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
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    const bip44HDPath = KeyRing.getKeyStoreBIP44Path(this.keyStore);

    if (this.type === "mnemonic") {
      const path = `m/44'/${coinType}'/${bip44HDPath.account}'/${bip44HDPath.change}/${bip44HDPath.addressIndex}`;
      const cachedKey = this.cached.get(path);
      if (cachedKey) {
        return new PrivKeySecp256k1(cachedKey);
      }

      if (!this.mnemonicMasterSeed) {
        throw new KeplrError(
          "keyring",
          133,
          "Key store type is mnemonic and it is unlocked. But, mnemonic is not loaded unexpectedly"
        );
      }

      const privKey = Mnemonic.generatePrivateKeyFromMasterSeed(
        this.mnemonicMasterSeed,
        path
      );

      this.cached.set(path, privKey);
      return new PrivKeySecp256k1(privKey);
    } else if (this.type === "privateKey") {
      // If key store type is private key, path will be ignored.

      if (!this.privateKey) {
        throw new KeplrError(
          "keyring",
          134,
          "Key store type is private key and it is unlocked. But, private key is not loaded unexpectedly"
        );
      }

      return new PrivKeySecp256k1(this.privateKey);
    } else {
      throw new KeplrError("keyring", 145, "Unexpected type of keyring");
    }
  }

  public async sign(
    env: Env,
    chainId: string,
    defaultCoinType: number,
    message: Uint8Array,
    useEthereumSigning: boolean
  ): Promise<Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
    }

    if (this.keyStore.type === "ledger") {
      const pubKeys = this.ledgerPublicKeyCache;

      if (!pubKeys) {
        throw new KeplrError(
          "keyring",
          151,
          "Ledger public key is not initialized"
        );
      }

      if (useEthereumSigning) {
        throw new Error("Can't sign cosmos sign doc by ethereum app on ledger");
      }

      return await this.ledgerKeeper.sign(
        env,
        KeyRing.getKeyStoreBIP44Path(this.keyStore),
        await this.ensureLedgerPublicKey(LedgerApp.Cosmos),
        message
      );
    } else {
      const coinType = this.computeKeyStoreCoinType(chainId, defaultCoinType);

      const privKey = this.loadPrivKey(coinType);
      const signature = useEthereumSigning
        ? privKey.signDigest32(Hash.keccak256(message))
        : privKey.sign(message);

      // Signing indicates an explicit use of this coin type.
      // Mainly, this logic exists to explicitly set the coin type when signing by an external request.
      if (!this.isKeyStoreCoinTypeSet(chainId)) {
        await this.setKeyStoreCoinType(chainId, coinType);
      }

      return signature;
    }
  }

  public async signEthereum(
    env: Env,
    chainId: string,
    defaultCoinType: number,
    message: Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    if (!this.keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
    }

    if (this.keyStore.type === "ledger") {
      if (!this.ledgerPublicKeyCache) {
        throw new KeplrError(
          "keyring",
          151,
          "Ledger public key is not initialized"
        );
      }

      return this.ledgerKeeper.signEthereum(
        env,
        type,
        KeyRing.getKeyStoreBIP44Path(this.keyStore),
        await this.ensureLedgerPublicKey(LedgerApp.Ethereum),
        message
      );
    }

    const coinType = this.computeKeyStoreCoinType(chainId, defaultCoinType);
    // Allow signing with Ethereum for chains with coinType !== 60
    const privKey = this.loadPrivKey(coinType);

    const ethWallet = new Wallet(privKey.toBytes());

    switch (type) {
      case EthSignType.MESSAGE: {
        // Sign bytes with prefixed Ethereum magic
        const signature = await ethWallet.signMessage(message);
        return BytesUtils.arrayify(signature);
      }
      case EthSignType.TRANSACTION: {
        // Sign Ethereum transaction
        const signature = await ethWallet.signTransaction(
          JSON.parse(Buffer.from(message).toString())
        );
        return BytesUtils.arrayify(signature);
      }
      case EthSignType.EIP712: {
        const data = await EIP712MessageValidator.validateAsync(
          JSON.parse(Buffer.from(message).toString())
        );
        // Since ethermint eip712 tx uses non-standard format, it cannot pass validation of ethersjs.
        // Therefore, it should be handled at a slightly lower level.
        const signature = await ethWallet._signingKey().signDigest(
          Hash.keccak256(
            Buffer.concat([
              // eth separator
              Buffer.from("19", "hex"),
              // Version: 1
              Buffer.from("01", "hex"),
              Buffer.from(
                _TypedDataEncoder
                  .hashStruct(
                    "EIP712Domain",
                    { EIP712Domain: data.types.EIP712Domain },
                    data.domain
                  )
                  .replace("0x", ""),
                "hex"
              ),
              Buffer.from(
                _TypedDataEncoder
                  .from(
                    // Seems that there is no way to set primary type and the first type becomes primary type.
                    (() => {
                      const types = { ...data.types };
                      delete types["EIP712Domain"];
                      const primary = types[data.primaryType];
                      if (!primary) {
                        throw new Error(
                          `No matched primary type: ${data.primaryType}`
                        );
                      }
                      delete types[data.primaryType];
                      return {
                        [data.primaryType]: primary,
                        ...types,
                      };
                    })()
                  )
                  .hash(data.message)
                  .replace("0x", ""),
                "hex"
              ),
            ])
          )
        );
        return Buffer.concat([
          Buffer.from(signature.r.replace("0x", ""), "hex"),
          Buffer.from(signature.s.replace("0x", ""), "hex"),
          // The metamask doesn't seem to consider the chain id in this case... (maybe bug on metamask?)
          signature.recoveryParam
            ? Buffer.from("1c", "hex")
            : Buffer.from("1b", "hex"),
        ]);
      }
      default:
        throw new Error(`Unknown sign type: ${type}`);
    }
  }

  // Show private key or mnemonic key if password is valid.
  public async showKeyRing(index: number, password: string): Promise<string> {
    if (this.status !== KeyRingStatus.UNLOCKED) {
      throw new KeplrError("keyring", 143, "Key ring is not unlocked");
    }

    if (this.password !== password) {
      throw new KeplrError("keyring", 121, "Invalid password");
    }

    const keyStore = this.multiKeyStore[index];

    if (!keyStore) {
      throw new KeplrError("keyring", 130, "Key store is empty");
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
      throw new KeplrError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    const keyStore = await KeyRing.CreateMnemonicKeyStore(
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
      throw new KeplrError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    const keyStore = await KeyRing.CreatePrivateKeyStore(
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

  public async addKeystoneKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new KeplrError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    // Get public key first
    const publicKey = await this.keystoneService.getPubkey(env, bip44HDPath);

    const pubKeys = {
      cosmos: publicKey,
    };

    const keyStore = await KeyRing.CreateKeystoneKeyStore(
      this.crypto,
      kdf,
      pubKeys,
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

  public async addLedgerKey(
    env: Env,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    if (this.status !== KeyRingStatus.UNLOCKED || this.password == "") {
      throw new KeplrError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    // Get public key first
    const publicKey = await this.ledgerKeeper.getPublicKey(
      env,
      LedgerApp.Cosmos,
      bip44HDPath
    );

    const pubKeys = {
      [LedgerApp.Cosmos]: publicKey,
    };

    const keyStore = await KeyRing.CreateLedgerKeyStore(
      this.crypto,
      kdf,
      pubKeys,
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
      throw new KeplrError(
        "keyring",
        141,
        "Key ring is locked or not initialized"
      );
    }

    const keyStore = this.multiKeyStore[index];
    if (!keyStore) {
      throw new KeplrError("keyring", 120, "Invalid keystore");
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
      throw new KeplrError("keyring", 100, "Keyring is locked");
    }

    return this.password === password;
  }

  async exportKeyRingDatas(password: string): Promise<ExportKeyRingData[]> {
    if (!this.password) {
      throw new KeplrError("keyring", 100, "Keyring is locked");
    }

    if (this.password !== password) {
      throw new KeplrError("keyring", 121, "Invalid password");
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
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
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
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyStore> {
    return await Crypto.encrypt(
      crypto,
      kdf,
      "privateKey",
      Buffer.from(privateKey).toString("hex"),
      password,
      meta
    );
  }

  private static async CreateKeystoneKeyStore(
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    publicKeys: Record<string, Uint8Array | undefined>,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    const publicKeyMap: Record<string, string> = {};
    Object.keys(publicKeys)
      .filter((k) => publicKeys[k] != null)
      .forEach(
        (k) =>
          (publicKeyMap[k] = Buffer.from(publicKeys[k] as Uint8Array).toString(
            "hex"
          ))
      );

    return await Crypto.encrypt(
      crypto,
      kdf,
      "keystone",
      JSON.stringify(publicKeyMap),
      password,
      meta,
      bip44HDPath
    );
  }

  private static async CreateLedgerKeyStore(
    crypto: CommonCrypto,
    kdf: "scrypt" | "sha256" | "pbkdf2",
    publicKeys: Record<string, Uint8Array | undefined>,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyStore> {
    const publicKeyMap: Record<string, string> = {};
    Object.keys(publicKeys)
      .filter((k) => publicKeys[k] != null)
      .forEach(
        (k) => (publicKeyMap[k] = Buffer.from(publicKeys[k]!).toString("hex"))
      );

    return await Crypto.encrypt(
      crypto,
      kdf,
      "ledger",
      JSON.stringify(publicKeyMap),
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
      throw new KeplrError("keyring", 131, "Key store's id is empty");
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
      throw new KeplrError("keyring", 100, "Invalid account in hd path");
    }

    if (
      !Number.isInteger(bip44Path.change) ||
      !(bip44Path.change === 0 || bip44Path.change === 1)
    ) {
      throw new KeplrError("keyring", 102, "Invalid change in hd path");
    }

    if (
      !Number.isInteger(bip44Path.addressIndex) ||
      bip44Path.addressIndex < 0
    ) {
      throw new KeplrError("keyring", 101, "Invalid address index in hd path");
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

  // XXX: There are other way to handle tx with ethermint on ledger.
  //      However, some chains have probably competitive spirit with evmos.
  //      They make unnecessary and silly minor changes to ethermint spec.
  //      Thus, there is a probability that it will potentially not work on other chains and they blame us.
  //      So, block them explicitly for now.
  public throwErrorIfEthermintWithLedgerButNotEvmos(chainId: string) {
    if (this.keyStore && this.keyStore.type === "ledger") {
      if (!chainId.startsWith("evmos_")) {
        throw new KeplrError(
          "keyring",
          152,
          "Ledger is unsupported for this chain"
        );
      }
    }
  }

  // Return public key if it has been initialized.
  // Else, try to initialize and return the public key.
  // There is no guarantee that the ledger has been initialized except for cosmos.
  // This method can handle the case of not initialized ledger app.
  // Use this method instead of use `this.ledgerPublicKeyCache`
  private ensureLedgerPublicKey(ledgerApp: LedgerApp): Uint8Array {
    if (!this.keyStore) {
      throw new KeplrError("keyring", 130, "Keystore is empty");
    }

    if (this.keyStore.type !== "ledger") {
      throw new Error("Keystore is not ledger");
    }

    if (!this.ledgerPublicKeyCache) {
      throw new KeplrError("keyring", 150, "Ledger not initialized");
    }

    const cached = this.ledgerPublicKeyCache[ledgerApp];
    if (cached) {
      return cached;
    }

    throw new KeplrError(
      "keyring",
      901,
      "Please initialize ethereum app on ledger first"
    );
  }

  public async initializeNonDefaultLedgerApp(env: Env, ledgerApp: LedgerApp) {
    if (!this.keyStore) {
      throw new KeplrError("keyring", 130, "Keystore is empty");
    }

    if (this.keyStore.type !== "ledger") {
      throw new Error("Keystore is not ledger");
    }

    if (!this.ledgerPublicKeyCache) {
      throw new KeplrError("keyring", 150, "Ledger not initialized");
    }

    const cached = this.ledgerPublicKeyCache[ledgerApp];
    if (cached) {
      throw new Error(`Ledger app (${ledgerApp}) has been initialized`);
    }

    const pubKey = await this.ledgerKeeper.getPublicKey(
      env,
      ledgerApp,
      KeyRing.getKeyStoreBIP44Path(this.keyStore)
    );

    const pubKeys = {
      ...this.ledgerPublicKeyCache,
      [ledgerApp]: pubKey,
    };

    // Create a new keystore that is equivalent in all ways, except for the ciphertext,
    // to persist the new public key.
    const newKeyStore = await KeyRing.CreateLedgerKeyStore(
      this.crypto,
      this.keyStore.crypto.kdf,
      pubKeys,
      this.password,
      this.keyStore.meta ?? {},
      this.keyStore.bip44HDPath ?? {
        account: 0,
        change: 0,
        addressIndex: 0,
      }
    );

    // Replace the keystore in the MultiKeyStore
    let index: number | undefined;
    this.multiKeyStore.forEach((k, i) => {
      if (
        this.keyStore &&
        KeyRing.getKeyStoreId(this.keyStore) === KeyRing.getKeyStoreId(k)
      ) {
        index = i;
      }
    });

    if (index === undefined) {
      throw new Error("Could not find keystore in keyring");
    }

    // Update local cache
    this.ledgerPublicKeyCache = pubKeys;

    // Persist keystore changes
    this.keyStore = newKeyStore;
    this.multiKeyStore[index] = newKeyStore;

    // No need to wait.
    this.save();

    return pubKey;
  }
}
