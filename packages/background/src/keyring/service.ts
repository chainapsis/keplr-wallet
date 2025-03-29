import { PlainObject, Vault, VaultService } from "../vault";
import {
  BIP44HDPath,
  ExportedKeyRingVault,
  ExtendedKey,
  KeyInfo,
  KeyRing,
  KeyRingStatus,
} from "./types";
import { Env, WEBPAGE_PORT } from "@keplr-wallet/router";
import {
  PubKeyBitcoinCompatible,
  PubKeySecp256k1,
  PubKeyStarknet,
} from "@keplr-wallet/crypto";
import { ChainsService } from "../chains";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { InteractionService } from "../interaction";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { Buffer } from "buffer/";
import * as Legacy from "./legacy";
import { ChainsUIService } from "../chains-ui";
import { MultiAccounts } from "../keyring-keystone";
import { AnalyticsService } from "../analytics";
import { Primitive } from "utility-types";
import { runIfOnlyAppStart } from "../utils";
import { Network as BitcoinNetwork, Psbt } from "bitcoinjs-lib";
import { DEFAULT_BIP44_PURPOSE } from "./constants";
import { Buffer as NodeBuffer } from "buffer";

export class KeyRingService {
  protected _needMigration = false;
  protected _isMigrating = false;

  @observable
  protected _selectedVaultId: string | undefined = undefined;

  // key: {bech32_prefix}/{hex}
  protected cacheKeySearchHexToBech32 = new Map<string, string>();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly migrations: {
      readonly kvStore: KVStore;
      readonly commonCrypto: Legacy.CommonCrypto;
      readonly chainsUIService: ChainsUIService;
      readonly getDisabledChainIdentifiers: () => Promise<string[]>;
    },
    protected readonly chainsService: ChainsService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly interactionService: InteractionService,
    protected readonly vaultService: VaultService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly keyRings: KeyRing[]
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const migrated = await this.kvStore.get<boolean>("migration/v1");
    if (!migrated) {
      const multiKeyStore = await this.migrations.kvStore.get<
        Legacy.KeyStore[]
      >("key-multi-store");

      if (multiKeyStore && multiKeyStore.length > 0) {
        this._needMigration = true;
      }
    }

    const selectedVaultId = await this.kvStore.get<string>("selectedVaultId");
    if (
      selectedVaultId &&
      this.vaultService.getVault("keyRing", selectedVaultId)
    ) {
      runInAction(() => {
        this._selectedVaultId = selectedVaultId;
      });
    }
    autorun(() => {
      if (this._selectedVaultId) {
        this.kvStore.set<string>("selectedVaultId", this._selectedVaultId);
      } else {
        this.kvStore.set<string>("selectedVaultId", null);
      }
    });

    // service worker가 active 상태가 되는 경우라면
    // 첫번째 autorun에서 analytics는 무시되어야한다.
    let isStarted = false;
    await runIfOnlyAppStart("analytics/keyring-service", async () => {
      isStarted = true;
    });
    let autorunFirst = true;
    autorun(() => {
      const vaults = this.getKeyRingVaults();
      const numPerTypes: Record<string, number> = {};
      for (const vault of vaults) {
        let type = vault.insensitive["keyRingType"] as string;
        if (type === "private-key") {
          const meta = vault.insensitive["keyRingMeta"] as PlainObject;
          if (meta["web3Auth"] && (meta["web3Auth"] as any)["type"]) {
            type = "web3_auth_" + (meta["web3Auth"] as any)["type"];
          }
        }

        if (type) {
          type = "keyring_" + type + "_num";

          if (!numPerTypes[type]) {
            numPerTypes[type] = 0;
          }
          numPerTypes[type] += 1;
        }
      }

      if (isStarted || !autorunFirst) {
        this.analyticsService.logEvent("user_properties", {
          keyring_num: vaults.length,
          ...numPerTypes,
        });
      }

      autorunFirst = false;
    });
  }

  lockKeyRing(): void {
    this.vaultService.lock();
  }

  async ensureUnlockInteractive(env: Env): Promise<void> {
    if (this.vaultService.isLocked) {
      await this.interactionService.waitApproveV2(
        env,
        "/unlock",
        "unlock",
        {},
        () => {
          // noop
        }
      );
    }
  }

  get needMigration(): boolean {
    return this._needMigration;
  }

  get isMigrating(): boolean {
    return this._isMigrating;
  }

  async unlockKeyRing(password: string): Promise<void> {
    if (this._needMigration) {
      await this.migrate(password);
      return;
    }
    await this.vaultService.unlock(password);
  }

  async checkLegacyKeyRingPassword(password: string): Promise<void> {
    if (!this._needMigration) {
      throw new Error("Migration is not needed");
    }

    const multiKeyStore = await this.migrations.kvStore.get<Legacy.KeyStore[]>(
      "key-multi-store"
    );
    if (!multiKeyStore || multiKeyStore.length === 0) {
      throw new Error("No key store to migrate");
    }

    // If password is invalid, error will be thrown.
    await Legacy.Crypto.decrypt(
      this.migrations.commonCrypto,
      multiKeyStore[0],
      password
    );
  }

  async getLegacyKeyringInfos(): Promise<Legacy.KeyStore[] | undefined> {
    const multiKeyStore = await this.migrations.kvStore.get<Legacy.KeyStore[]>(
      "key-multi-store"
    );

    return multiKeyStore;
  }

  async showSensitiveLegacyKeyringData(
    index: string,
    password: string
  ): Promise<string> {
    const multiKeyStore = await this.migrations.kvStore.get<Legacy.KeyStore[]>(
      "key-multi-store"
    );

    if (!multiKeyStore) {
      throw new Error("No key store");
    }

    const keyIndex = multiKeyStore.findIndex(
      (keyStore) => keyStore.meta?.["__id__"] === index
    );

    if (keyIndex < 0) {
      throw new Error("Key not found");
    }

    return Buffer.from(
      await Legacy.Crypto.decrypt(
        this.migrations.commonCrypto,
        multiKeyStore[keyIndex],
        password
      )
    ).toString();
  }

  protected async migrate(password: string): Promise<void> {
    if (!this._needMigration) {
      throw new Error("Migration is not needed");
    }

    if (this._isMigrating) {
      throw new Error("Migration is already in progress");
    }

    if (this.vaultService.isSignedUp && this.vaultService.isLocked) {
      await this.vaultService.unlock(password);
    }

    this._isMigrating = true;

    try {
      const legacySelectedKeyStore =
        await this.migrations.kvStore.get<Legacy.KeyStore>("key-store");
      const multiKeyStore = await this.migrations.kvStore.get<
        Legacy.KeyStore[]
      >("key-multi-store");

      let selectingVaultId: string | undefined = undefined;
      if (!multiKeyStore || multiKeyStore.length === 0) {
        throw new Error("No key store to migrate");
      }

      const disabledChainIdentifierMap = new Map<string, boolean>();
      for (const chainIdentifier of await this.migrations.getDisabledChainIdentifiers()) {
        if (!this.chainsService.hasChainInfo(chainIdentifier)) {
          continue;
        }

        const identifier = ChainIdHelper.parse(chainIdentifier).identifier;
        disabledChainIdentifierMap.set(identifier, true);
      }

      const checkChainDisabled = (chainId: string) => {
        if (disabledChainIdentifierMap.size === 0) {
          return false;
        }
        return (
          disabledChainIdentifierMap.get(
            ChainIdHelper.parse(chainId).identifier
          ) === true
        );
      };

      for (const keyStore of multiKeyStore) {
        const keyStoreId = keyStore.meta?.["__id__"];
        if (keyStoreId) {
          const migrated = await this.kvStore.get<boolean>(
            "migration/v1/keyStore/" + keyStoreId
          );
          if (migrated) {
            continue;
          }
        }

        if (keyStore.type === "mnemonic") {
          // If password is invalid, error will be thrown.
          const mnemonic = Buffer.from(
            await Legacy.Crypto.decrypt(
              this.migrations.commonCrypto,
              keyStore,
              password
            )
          ).toString();
          const vaultId = await this.createMnemonicKeyRing(
            mnemonic,
            keyStore.bip44HDPath ?? {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            keyStore.meta?.["name"] ?? "Keplr Account",
            password
          );
          if (keyStore.coinTypeForChain) {
            for (const chainInfo of this.chainsService.getChainInfos()) {
              const coinType =
                keyStore.coinTypeForChain[
                  ChainIdHelper.parse(chainInfo.chainId).identifier
                ];
              if (
                coinType != null &&
                this.needKeyCoinTypeFinalize(vaultId, chainInfo.chainId)
              ) {
                if (
                  chainInfo.bip44.coinType === coinType ||
                  (chainInfo.alternativeBIP44s ?? []).find(
                    (path) => path.coinType === coinType
                  )
                ) {
                  this.finalizeKeyCoinType(
                    vaultId,
                    chainInfo.chainId,
                    coinType
                  );
                } else {
                  // Add some info for handling further debugging or migration.
                  const prev =
                    (await this.kvStore.get<
                      {
                        chainId: string;
                        coinType: number;
                      }[]
                    >("__migrate_skip_coin_type")) || [];
                  prev.push({
                    chainId: chainInfo.chainId,
                    coinType,
                  });
                  await this.kvStore.set<
                    {
                      chainId: string;
                      coinType: number;
                    }[]
                  >("__migrate_skip_coin_type", prev);
                }
              }
            }
          }

          for (const chainInfo of this.chainsService.getChainInfos()) {
            if (checkChainDisabled(chainInfo.chainId)) {
              continue;
            }

            if (!this.needKeyCoinTypeFinalize(vaultId, chainInfo.chainId)) {
              this.migrations.chainsUIService.enableChain(
                vaultId,
                chainInfo.chainId
              );
            }
          }

          if (
            keyStore.meta?.["__id__"] ===
            legacySelectedKeyStore?.meta?.["__id__"]
          ) {
            selectingVaultId = vaultId;
          }
        } else if (keyStore.type === "privateKey") {
          // If password is invalid, error will be thrown.
          const privateKey = Buffer.from(
            Buffer.from(
              await Legacy.Crypto.decrypt(
                this.migrations.commonCrypto,
                keyStore,
                password
              )
            ).toString(),
            "hex"
          );
          const meta: PlainObject = {};
          if (keyStore.meta?.["email"]) {
            const socialType = keyStore.meta["socialType"] || "google";
            meta["web3Auth"] = {
              email: keyStore.meta["email"],
              type: socialType,
            };
          }
          const vaultId = await this.createPrivateKeyKeyRing(
            privateKey,
            meta,
            keyStore.meta?.["name"] ?? "Keplr Account",
            password
          );

          for (const chainInfo of this.chainsService.getChainInfos()) {
            if (checkChainDisabled(chainInfo.chainId)) {
              continue;
            }

            this.migrations.chainsUIService.enableChain(
              vaultId,
              chainInfo.chainId
            );
          }

          if (
            keyStore.meta?.["__id__"] ===
            legacySelectedKeyStore?.meta?.["__id__"]
          ) {
            selectingVaultId = vaultId;
          }
        } else if (keyStore.type === "ledger") {
          // Attempt to decode the ciphertext as a JSON public key map. If that fails,
          // try decoding as a single public key hex.
          const cipherText = await Legacy.Crypto.decrypt(
            this.migrations.commonCrypto,
            keyStore,
            password
          );

          let isObj = false;
          try {
            isObj =
              Buffer.from(Buffer.from(cipherText).toString(), "hex")
                .toString("hex")
                .toLowerCase() !==
              Buffer.from(cipherText).toString().toLowerCase();
          } catch {
            isObj = true;
          }

          if (isObj) {
            const encodedPubkeys = JSON.parse(
              Buffer.from(cipherText).toString()
            );
            if (encodedPubkeys["cosmos"]) {
              const pubKey = Buffer.from(
                encodedPubkeys["cosmos"] as string,
                "hex"
              );
              const vaultId = await this.createLedgerKeyRing(
                pubKey,
                keyStore.meta?.["__ledger__cosmos_app_like__"] === "Terra"
                  ? "Terra"
                  : "Cosmos",
                keyStore.bip44HDPath ?? {
                  account: 0,
                  change: 0,
                  addressIndex: 0,
                },
                keyStore.meta?.["name"] ?? "Keplr Account",
                password
              );

              let hasEthereum = false;
              if (encodedPubkeys["ethereum"]) {
                const pubKey = Buffer.from(
                  encodedPubkeys["ethereum"] as string,
                  "hex"
                );
                this.appendLedgerKeyRing(vaultId, pubKey, "Ethereum");

                hasEthereum = true;
              }

              for (const chainInfo of this.chainsService.getChainInfos()) {
                if (checkChainDisabled(chainInfo.chainId)) {
                  continue;
                }

                if (KeyRingService.isEthermintLike(chainInfo) && !hasEthereum) {
                  continue;
                }

                this.migrations.chainsUIService.enableChain(
                  vaultId,
                  chainInfo.chainId
                );
              }

              if (
                keyStore.meta?.["__id__"] ===
                legacySelectedKeyStore?.meta?.["__id__"]
              ) {
                selectingVaultId = vaultId;
              }
            }
          } else {
            // Decode as bytes (Legacy representation)
            const pubKey = Buffer.from(
              Buffer.from(cipherText).toString(),
              "hex"
            );
            const vaultId = await this.createLedgerKeyRing(
              pubKey,
              "Cosmos",
              keyStore.bip44HDPath ?? {
                account: 0,
                change: 0,
                addressIndex: 0,
              },
              keyStore.meta?.["name"] ?? "Keplr Account",
              password
            );

            for (const chainInfo of this.chainsService.getChainInfos()) {
              if (checkChainDisabled(chainInfo.chainId)) {
                continue;
              }

              if (KeyRingService.isEthermintLike(chainInfo)) {
                continue;
              }

              this.migrations.chainsUIService.enableChain(
                vaultId,
                chainInfo.chainId
              );
            }

            if (
              keyStore.meta?.["__id__"] ===
              legacySelectedKeyStore?.meta?.["__id__"]
            ) {
              selectingVaultId = vaultId;
            }
          }
        } else {
          console.log("Unknown key store type", keyStore.type);
        }

        if (keyStoreId) {
          await this.kvStore.set("migration/v1/keyStore/" + keyStoreId, true);
        }
      }

      if (
        selectingVaultId &&
        this.vaultService.getVault("keyRing", selectingVaultId)
      ) {
        this.selectKeyRing(selectingVaultId);
      }

      await this.kvStore.set("migration/v1", true);
      this._needMigration = false;
    } finally {
      // Set the flag to false even if the migration is failed.
      this._isMigrating = false;
    }
  }

  @action
  selectKeyRing(vaultId: string): void {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    if (!this.vaultService.getVault("keyRing", vaultId)) {
      throw new Error("Unknown vault");
    }

    this._selectedVaultId = vaultId;

    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {});
  }

  get keyRingStatus(): KeyRingStatus {
    if (this._needMigration) {
      // If the migration is needed, assume that key ring is locked.
      // Because, the migration starts when key ring would be unlocked.
      return "locked";
    }

    if (
      !this.vaultService.isSignedUp ||
      this.vaultService.getVaults("keyRing").length === 0
    ) {
      return "empty";
    }

    return this.vaultService.isLocked ? "locked" : "unlocked";
  }

  getKeyRingVaults(): Vault[] {
    return this.vaultService.getVaults("keyRing");
  }

  getKeyInfos(): KeyInfo[] {
    return this.getKeyRingVaults().map((vault) => {
      return {
        id: vault.id,
        name: vault.insensitive["keyRingName"] as string,
        type: vault.insensitive["keyRingType"] as string,
        isSelected: this._selectedVaultId === vault.id,
        insensitive: vault.insensitive,
      };
    });
  }

  getKeyInfo(vaultId: string): KeyInfo | undefined {
    return this.getKeyInfos().find((keyInfo) => keyInfo.id === vaultId);
  }

  // Return selected vault id.
  // If selected vault doesn't exist for unknown reason,
  // try to return first id for key rings.
  // If key rings are empty, throw an error.
  get selectedVaultId(): string {
    if (
      this._selectedVaultId &&
      this.vaultService.getVault("keyRing", this._selectedVaultId)
    ) {
      return this._selectedVaultId;
    }
    const vaults = this.vaultService.getVaults("keyRing");
    if (vaults.length === 0) {
      throw new Error("Key ring is empty");
    }
    return vaults[0].id;
  }

  finalizeKeyCoinType(
    vaultId: string,
    chainId: string,
    coinType: number
  ): void {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    if ("cosmos" in modularChainInfo) {
      const chainInfo = modularChainInfo.cosmos;
      if (
        chainInfo.bip44.coinType !== coinType &&
        !(chainInfo.alternativeBIP44s ?? []).find(
          (path) => path.coinType === coinType
        )
      ) {
        throw new Error("Coin type is not associated to chain");
      }
    }
    if ("starknet" in modularChainInfo) {
      // TODO: starknet에서는 일단 코인타입을 9004로 고정해서 쓴다.
      //       일단은 임시조치인데 나중에 다른 방식으로 바뀔수도 있다.
      if (coinType !== 9004) {
        throw new Error("Coin type is not associated to chain");
      }
    }
    if ("bitcoin" in modularChainInfo) {
      const chainInfo = modularChainInfo.bitcoin;
      if (chainInfo.bip44.coinType !== coinType) {
        throw new Error("Coin type is not associated to chain");
      }
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    if (
      vault.insensitive["keyRingType"] !== "mnemonic" &&
      vault.insensitive["keyRingType"] !== "keystone"
    ) {
      throw new Error("Key is not needed to be finalized");
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    if (vault.insensitive[coinTypeTag]) {
      throw new Error("Coin type is already finalized");
    }

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vaultId, {
      [coinTypeTag]: coinType,
    });
  }

  needKeyCoinTypeFinalize(vaultId: string, chainId: string): boolean {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    if (
      vault.insensitive["keyRingType"] !== "mnemonic" &&
      vault.insensitive["keyRingType"] !== "keystone"
    ) {
      return false;
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    return !vault.insensitive[coinTypeTag];
  }

  async createMnemonicKeyRing(
    mnemonic: string,
    bip44Path: BIP44HDPath,
    name: string,
    password?: string,
    meta?: PlainObject
  ): Promise<string> {
    if (!this.vaultService.isSignedUp) {
      if (!password) {
        throw new Error("Must provide password to sign in to vault");
      }

      await this.vaultService.signUp(password);
    }

    KeyRingService.validateBIP44Path(bip44Path);

    const keyRing = this.getKeyRing("mnemonic");
    const vaultData = await keyRing.createKeyRingVault(mnemonic, bip44Path);

    // Finalize coin type if only one coin type exists.
    const coinTypes: Record<string, number | undefined> = {};
    const chainInfos = this.chainsService.getChainInfos();
    for (const chainInfo of chainInfos) {
      if (
        !chainInfo.alternativeBIP44s ||
        chainInfo.alternativeBIP44s.length === 0
      ) {
        const coinTypeTag = `keyRing-${
          ChainIdHelper.parse(chainInfo.chainId).identifier
        }-coinType`;
        coinTypes[coinTypeTag] = chainInfo.bip44.coinType;
      }
    }

    const id = this.vaultService.addVault(
      "keyRing",
      {
        ...vaultData.insensitive,
        ...coinTypes,
        keyRingName: name,
        keyRingType: keyRing.supportedKeyRingType(),
        keyRingMeta: meta,
      },
      vaultData.sensitive
    );

    runInAction(() => {
      this._selectedVaultId = id;
    });

    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {});

    return id;
  }

  async createLedgerKeyRing(
    pubKey: Uint8Array,
    app: string,
    bip44Path: BIP44HDPath,
    name: string,
    password?: string
  ): Promise<string> {
    if (!this.vaultService.isSignedUp) {
      if (!password) {
        throw new Error("Must provide password to sign in to vault");
      }

      await this.vaultService.signUp(password);
    }

    KeyRingService.validateBIP44Path(bip44Path);

    const keyRing = this.getKeyRing("ledger");
    const vaultData = await keyRing.createKeyRingVault(pubKey, app, bip44Path);

    const id = this.vaultService.addVault(
      "keyRing",
      {
        ...vaultData.insensitive,
        keyRingName: name,
        keyRingType: keyRing.supportedKeyRingType(),
      },
      vaultData.sensitive
    );

    runInAction(() => {
      this._selectedVaultId = id;
    });

    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {});

    return id;
  }

  async createKeystoneKeyRing(
    multiAccounts: MultiAccounts,
    name: string,
    password?: string
  ): Promise<string> {
    if (!this.vaultService.isSignedUp) {
      if (!password) {
        throw new Error("Must provide password to sign in to vault");
      }

      await this.vaultService.signUp(password);
    }

    multiAccounts.keys.forEach((key) => {
      const result = KeyRingService.parseBIP44Path(key.path);
      KeyRingService.validateBIP44Path(result.path);
    });

    const keyRing = this.getKeyRing("keystone");
    const vaultData = await keyRing.createKeyRingVault(multiAccounts);

    // Finalize coin type if only one coin type exists.
    const coinTypes: Record<string, number | undefined> = {};
    const chainInfos = this.chainsService.getChainInfos();
    for (const chainInfo of chainInfos) {
      if (
        !chainInfo.alternativeBIP44s ||
        chainInfo.alternativeBIP44s.length === 0
      ) {
        const coinTypeTag = `keyRing-${
          ChainIdHelper.parse(chainInfo.chainId).identifier
        }-coinType`;
        coinTypes[coinTypeTag] = chainInfo.bip44.coinType;
      }
    }

    const id = this.vaultService.addVault(
      "keyRing",
      {
        ...vaultData.insensitive,
        ...coinTypes,
        keyRingName: name,
        keyRingType: keyRing.supportedKeyRingType(),
      },
      vaultData.sensitive
    );

    runInAction(() => {
      this._selectedVaultId = id;
    });

    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {});

    return id;
  }

  async createPrivateKeyKeyRing(
    privateKey: Uint8Array,
    meta: PlainObject,
    name: string,
    password?: string
  ): Promise<string> {
    if (!this.vaultService.isSignedUp) {
      if (!password) {
        throw new Error("Must provide password to sign in to vault");
      }

      await this.vaultService.signUp(password);
    }

    const keyRing = this.getKeyRing("private-key");
    const vaultData = await keyRing.createKeyRingVault(privateKey);

    const id = this.vaultService.addVault(
      "keyRing",
      {
        ...vaultData.insensitive,
        keyRingName: name,
        keyRingType: keyRing.supportedKeyRingType(),
        keyRingMeta: meta,
      },
      vaultData.sensitive
    );

    runInAction(() => {
      this._selectedVaultId = id;
    });

    this.interactionService.dispatchEvent(WEBPAGE_PORT, "keystore-changed", {});

    return id;
  }

  appendLedgerKeyRing(id: string, pubKey: Uint8Array, app: string) {
    const vault = this.vaultService.getVault("keyRing", id);
    if (!vault) {
      throw new Error("Vault is null");
    }

    if (vault.insensitive["keyRingType"] !== "ledger") {
      throw new Error("Key is not from ledger");
    }

    if (vault.insensitive[app]) {
      throw new Error("App is already appended");
    }

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", id, {
      [app]: {
        pubKey: Buffer.from(pubKey).toString("hex"),
      },
    });
  }

  appendLedgerExtendedKeyRings(
    vaultId: string,
    extendedKeys: ExtendedKey[],
    app: string
  ) {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    if (vault.insensitive["keyRingType"] !== "ledger") {
      throw new Error("Key is not from ledger");
    }

    const keyValues: Record<string, string> = {};

    for (const extendedKey of extendedKeys) {
      const key = `${extendedKey.purpose}-${extendedKey.coinType}`;
      const value =
        "xpub" in extendedKey
          ? extendedKey.xpub
          : Buffer.from(extendedKey.pubKey).toString("hex");

      keyValues[key] = value;
    }

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vaultId, {
      [app]: {
        ...(vault.insensitive[app] as any),
        ...keyValues,
      },
    });
  }
  getPubKeySelected(chainId: string): Promise<PubKeySecp256k1> {
    return this.getPubKey(chainId, this.selectedVaultId);
  }

  getKeyRingNameSelected(): string {
    return this.getKeyRingName(this.selectedVaultId);
  }

  getKeyRingName(vaultId: string): string {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    return (vault.insensitive["keyRingName"] as string) || "Keplr Account";
  }

  @action
  changeKeyRingName(vaultId: string, name: string) {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vaultId, {
      keyRingName: name,
    });

    if (this.selectedVaultId === vault.id) {
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  async changeKeyRingNameInteractive(
    env: Env,
    vaultId: string,
    defaultName: string,
    editable: boolean
  ): Promise<string> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    return await this.interactionService.waitApproveV2(
      env,
      `/wallet/change-name?id=${vaultId}`,
      "change-keyring-name",
      {
        defaultName,
        editable,
      },
      (name: string) => {
        this.changeKeyRingName(vaultId, name);
        return name;
      }
    );
  }

  async deleteKeyRing(vaultId: string, password: string) {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    await this.vaultService.checkUserPassword(password);

    const wasSelected = this.selectedVaultId === vaultId;

    this.vaultService.removeVault("keyRing", vaultId);

    if (wasSelected) {
      runInAction(() => {
        const keyInfos = this.getKeyInfos();
        if (keyInfos.length > 0) {
          this._selectedVaultId = keyInfos[0].id;
        } else {
          this._selectedVaultId = undefined;
        }
      });
    }

    if (wasSelected) {
      this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }

    if (this.getKeyRingVaults().length === 0) {
      // After deleting all keyring, sign out from the vault.
      await this.vaultService.clearAll(password);
    }

    return wasSelected;
  }

  signSelected(
    chainId: string,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<{
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  }> {
    return this.sign(chainId, this.selectedVaultId, data, digestMethod);
  }

  getPubKey(chainId: string, vaultId: string): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const purpose =
      (() => {
        if ("cosmos" in modularChainInfo) {
          return modularChainInfo.cosmos.bip44.purpose;
        }

        if ("bitcoin" in modularChainInfo) {
          return modularChainInfo.bitcoin.bip44.purpose;
        }
      })() ?? DEFAULT_BIP44_PURPOSE;

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    const coinType = (() => {
      if (vault.insensitive[coinTypeTag]) {
        return vault.insensitive[coinTypeTag] as number;
      }

      if ("cosmos" in modularChainInfo) {
        return modularChainInfo.cosmos.bip44.coinType;
      }

      // TODO: starknet에서는 일단 코인타입을 9004로 고정해서 쓴다.
      //       일단은 임시조치인데 나중에 다른 방식으로 바뀔수도 있다.
      if ("starknet" in modularChainInfo) {
        return 9004;
      }

      if ("bitcoin" in modularChainInfo) {
        return modularChainInfo.bitcoin.bip44.coinType;
      }

      throw new Error("Can't determine default coin type");
    })();

    return this.getPubKeyWithVault(vault, purpose, coinType, modularChainInfo);
  }

  getPubKeyStarknet(chainId: string, vaultId: string): Promise<PubKeyStarknet> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    return this.getStarknetPubKeyWithVault(vault, modularChainInfo);
  }

  getPubKeyBitcoin(
    chainId: string,
    vaultId: string,
    network: BitcoinNetwork
  ): Promise<PubKeyBitcoinCompatible> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const purpose =
      (() => {
        if ("bitcoin" in modularChainInfo) {
          return modularChainInfo.bitcoin.bip44.purpose;
        }
      })() ?? DEFAULT_BIP44_PURPOSE;

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    const coinType = (() => {
      if (vault.insensitive[coinTypeTag]) {
        return vault.insensitive[coinTypeTag] as number;
      }

      if ("bitcoin" in modularChainInfo) {
        return modularChainInfo.bitcoin.bip44.coinType;
      }

      throw new Error("Can't determine default coin type");
    })();

    return this.getPubKeyBitcoinWithVault(
      vault,
      purpose,
      coinType,
      network,
      modularChainInfo
    );
  }

  getPubKeyWithNotFinalizedCoinType(
    chainId: string,
    vaultId: string,
    purpose: number,
    coinType: number
  ): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    if ("cosmos" in modularChainInfo) {
      if (
        modularChainInfo.cosmos.bip44.coinType !== coinType &&
        !(modularChainInfo.cosmos.alternativeBIP44s ?? []).find(
          (path) => path.coinType === coinType
        )
      ) {
        throw new Error("Coin type is not associated to chain");
      }
    } else if ("starknet" in modularChainInfo) {
      // TODO: starknet에서는 일단 코인타입을 9004로 고정해서 쓴다.
      //       일단은 임시조치인데 나중에 다른 방식으로 바뀔수도 있다.
      if (coinType !== 9004) {
        throw new Error("Coin type is not associated to chain");
      }
    } else if ("bitcoin" in modularChainInfo) {
      if (modularChainInfo.bitcoin.bip44.coinType !== coinType) {
        throw new Error("Coin type is not associated to chain");
      }
    } else {
      throw new Error("Can't know that the coin type is associated to chain");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    if (
      vault.insensitive["keyRingType"] !== "mnemonic" &&
      vault.insensitive["keyRingType"] !== "keystone"
    ) {
      throw new Error("Key is not needed to be finalized");
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    if (vault.insensitive[coinTypeTag]) {
      throw new Error("Coin type is already finalized");
    }

    return this.getPubKeyWithVault(vault, purpose, coinType, modularChainInfo);
  }

  sign(
    chainId: string,
    vaultId: string,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256" | "hash256" | "noop"
  ): Promise<{
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  }> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const purpose =
      (() => {
        if ("cosmos" in modularChainInfo) {
          return modularChainInfo.cosmos.bip44.purpose;
        }

        if ("bitcoin" in modularChainInfo) {
          return modularChainInfo.bitcoin.bip44.purpose;
        }
      })() ?? DEFAULT_BIP44_PURPOSE;

    const coinType = (() => {
      if ("cosmos" in modularChainInfo) {
        const coinTypeTag = `keyRing-${
          ChainIdHelper.parse(chainId).identifier
        }-coinType`;

        if (vault.insensitive[coinTypeTag]) {
          return vault.insensitive[coinTypeTag] as number;
        }

        return modularChainInfo.cosmos.bip44.coinType;
      } else if ("starknet" in modularChainInfo) {
        // TODO: starknet에서는 일단 코인타입을 9004로 고정해서 쓴다.
        //       일단은 임시조치인데 나중에 다른 방식으로 바뀔수도 있다.
        return 9004;
      } else if ("bitcoin" in modularChainInfo) {
        return modularChainInfo.bitcoin.bip44.coinType;
      } else {
        throw new Error("Can't determine default coin type");
      }
    })();

    const signature = this.signWithVault(
      vault,
      purpose,
      coinType,
      data,
      digestMethod,
      modularChainInfo
    );

    if (this.needKeyCoinTypeFinalize(vault.id, chainId)) {
      this.finalizeKeyCoinType(vault.id, chainId, coinType);
    }

    return signature;
  }

  signPsbt(
    chainId: string,
    vaultId: string,
    psbt: Psbt,
    inputsToSign: {
      index: number;
      address: string;
      hdPath?: string;
      tapLeafHashesToSign?: NodeBuffer[];
    }[],
    network: BitcoinNetwork
  ) {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const modularChainInfo =
      this.chainsService.getModularChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const purpose =
      (() => {
        if ("bitcoin" in modularChainInfo) {
          return modularChainInfo.bitcoin.bip44.purpose;
        }
      })() ?? DEFAULT_BIP44_PURPOSE;

    const coinType = (() => {
      if ("bitcoin" in modularChainInfo) {
        return modularChainInfo.bitcoin.bip44.coinType;
      }

      throw new Error("Can't determine default coin type");
    })();

    const signedPsbt = this.signPsbtWithVault(
      vault,
      purpose,
      coinType,
      psbt,
      inputsToSign,
      network,
      modularChainInfo
    );

    if (this.needKeyCoinTypeFinalize(vault.id, chainId)) {
      this.finalizeKeyCoinType(vault.id, chainId, coinType);
    }

    return signedPsbt;
  }

  getStarknetPubKeyWithVault(
    vault: Vault,
    modularChainInfo: ModularChainInfo
  ): Promise<PubKeyStarknet> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    if (typeof keyRing.getPubKeyStarknet !== "function") {
      throw new Error("This keyring doesn't support 'getPubKeyStarknet'");
    }

    return Promise.resolve(keyRing.getPubKeyStarknet(vault, modularChainInfo));
  }

  getPubKeyWithVault(
    vault: Vault,
    purpose: number,
    coinType: number,
    modularChainInfo: ModularChainInfo
  ): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.getPubKey(vault, purpose, coinType, modularChainInfo)
    );
  }

  getPubKeyBitcoinWithVault(
    vault: Vault,
    purpose: number,
    coinType: number,
    network: BitcoinNetwork,
    modularChainInfo: ModularChainInfo
  ): Promise<PubKeyBitcoinCompatible> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    if (typeof keyRing.getPubKeyBitcoin !== "function") {
      return Promise.resolve(
        (async () =>
          (
            await keyRing.getPubKey(vault, purpose, coinType, modularChainInfo)
          ).toBitcoinPubKey(network))()
      );
    }

    return Promise.resolve(
      keyRing.getPubKeyBitcoin(
        vault,
        purpose,
        coinType,
        network,
        modularChainInfo
      )
    );
  }
  signWithVault(
    vault: Vault,
    purpose: number,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256" | "hash256" | "noop",
    modularChainInfo: ModularChainInfo
  ): Promise<{
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  }> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.sign(
        vault,
        purpose,
        coinType,
        data,
        digestMethod,
        modularChainInfo
      )
    );
  }

  signPsbtWithVault(
    vault: Vault,
    purpose: number,
    coinType: number,
    psbt: Psbt,
    inputsToSign: {
      index: number;
      address: string;
      hdPath?: string;
      tapLeafHashesToSign?: NodeBuffer[];
    }[],
    network: BitcoinNetwork,
    modularChainInfo: ModularChainInfo
  ) {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    if (typeof keyRing.signPsbt !== "function") {
      throw new Error("This keyring doesn't support 'signPsbt'");
    }

    return Promise.resolve(
      keyRing.signPsbt(
        vault,
        purpose,
        coinType,
        psbt,
        inputsToSign,
        network,
        modularChainInfo
      )
    );
  }

  async showSensitiveKeyRingData(
    vaultId: string,
    password: string
  ): Promise<string> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    await this.vaultService.checkUserPassword(password);

    switch (vault.insensitive["keyRingType"]) {
      case "mnemonic": {
        const sensitive = this.vaultService.decrypt(vault.sensitive);
        return sensitive["mnemonic"] as string;
      }
      case "private-key": {
        const sensitive = this.vaultService.decrypt(vault.sensitive);
        return sensitive["privateKey"] as string;
      }
      default: {
        throw new Error("Unsupported keyRing type to show sensitive data");
      }
    }
  }

  async checkUserPassword(password: string): Promise<boolean> {
    try {
      await this.vaultService.checkUserPassword(password);
    } catch (e) {
      return false;
    }

    return true;
  }

  async changeUserPassword(
    prevUserPassword: string,
    newUserPassword: string
  ): Promise<void> {
    await this.vaultService.changeUserPassword(
      prevUserPassword,
      newUserPassword
    );
  }

  async exportKeyRingVaults(password: string): Promise<ExportedKeyRingVault[]> {
    await this.vaultService.checkUserPassword(password);

    const result: ExportedKeyRingVault[] = [];
    for (const vault of this.getKeyRingVaults()) {
      if (vault.insensitive["keyRingType"] === "mnemonic") {
        const decrypted = this.vaultService.decrypt(vault.sensitive);
        result.push({
          type: "mnemonic",
          id: vault.id,
          insensitive: vault.insensitive,
          sensitive: decrypted["mnemonic"] as string,
        });
      }
      if (vault.insensitive["keyRingType"] === "private-key") {
        const decrypted = this.vaultService.decrypt(vault.sensitive);
        result.push({
          type: "private-key",
          id: vault.id,
          insensitive: vault.insensitive,
          sensitive: decrypted["privateKey"] as string,
        });
      }
    }

    return result;
  }

  // Legacy
  async exportKeyRingData(
    password: string
  ): Promise<Legacy.ExportKeyRingData[]> {
    await this.vaultService.checkUserPassword(password);

    const result: Legacy.ExportKeyRingData[] = [];

    for (const keyInfo of this.getKeyInfos()) {
      const meta: { [key: string]: string } = {
        __id__: keyInfo.id,
        name: keyInfo.name,
      };

      switch (keyInfo.type) {
        case "mnemonic": {
          const mnemonic = await this.showSensitiveKeyRingData(
            keyInfo.id,
            password
          );

          result.push({
            bip44HDPath: (keyInfo.insensitive["bip44Path"] as any) ?? {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            coinTypeForChain: (() => {
              const res: {
                [identifier: string]: number;
              } = {};

              for (const chainInfo of this.chainsService.getChainInfos()) {
                const identifier = ChainIdHelper.parse(
                  chainInfo.chainId
                ).identifier;
                const coinTypeTag = `keyRing-${identifier}-coinType`;
                if (keyInfo.insensitive[coinTypeTag] != null) {
                  res[identifier] = keyInfo.insensitive[coinTypeTag] as number;
                }
              }

              return res;
            })(),
            key: mnemonic,
            meta,
            type: "mnemonic",
          });

          break;
        }
        case "private-key": {
          if (
            typeof keyInfo.insensitive === "object" &&
            keyInfo.insensitive["keyRingMeta"] &&
            typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
            keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
            typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
          ) {
            const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
            if (
              (web3Auth["type"] === "google" || web3Auth["type"] === "apple") &&
              web3Auth["email"]
            ) {
              meta["socialType"] = web3Auth["type"];
              meta["email"] = web3Auth["email"] as string;
            } else {
              // Keplr mobile only supports google web3Auth.
              continue;
            }
          }

          const privateKey = (
            await this.showSensitiveKeyRingData(keyInfo.id, password)
          ).replace("0x", "");

          result.push({
            // bip44HDPath is not used
            bip44HDPath: {
              account: 0,
              change: 0,
              addressIndex: 0,
            },
            // coinTypeForChain is not used
            coinTypeForChain: {},
            key: privateKey,
            meta,
            type: "privateKey",
          });

          break;
        }
      }
    }

    return result;
  }

  protected getVaultKeyRing(vault: Vault): KeyRing {
    for (const keyRing of this.keyRings) {
      if (vault.insensitive["keyRingType"] === keyRing.supportedKeyRingType()) {
        return keyRing;
      }
    }

    throw new Error("Unsupported keyRing vault");
  }

  protected getKeyRing(type: string): KeyRing {
    for (const keyRing of this.keyRings) {
      if (type === keyRing.supportedKeyRingType()) {
        return keyRing;
      }
    }

    throw new Error(`Unsupported keyRing ${type}`);
  }

  searchKeyRings(
    searchText: string,
    ignoreChainEnabled: boolean = false
  ): KeyInfo[] {
    searchText = searchText.trim();

    const keyInfos = this.getKeyInfos();

    if (!searchText) {
      return keyInfos;
    }

    const nameSearchKeyInfos = keyInfos.filter((keyInfo) => {
      return keyInfo.name.toLowerCase().includes(searchText.toLowerCase());
    });

    let bech32AddressSearchKeyInfos: KeyInfo[] = [];
    let hexAddressSearchKeyInfos: KeyInfo[] = [];
    if (searchText.length >= 8) {
      const isHex = (() => {
        if (searchText.startsWith("0x")) {
          return true;
        }
        try {
          const s = Buffer.from(searchText, "hex");
          return s.toString().toLowerCase() === searchText.toLowerCase();
        } catch {
          return false;
        }
      })();

      if (isHex) {
        hexAddressSearchKeyInfos = keyInfos.filter((keyInfo) => {
          const modularChainInfos =
            this.chainsUIService.enabledModularChainInfosForVault(keyInfo.id);
          // TODO: 다른 체인도 지원하기
          const chainInfos = modularChainInfos
            .filter((c) => "cosmos" in c)
            .map((c) => {
              if (!("cosmos" in c)) {
                throw new Error("Unsupported chain");
              }
              return c.cosmos;
            });

          let evmEnabled = false;
          for (const chainInfo of chainInfos) {
            if (KeyRingService.isEthermintLike(chainInfo)) {
              evmEnabled = true;
            }
          }
          if (!evmEnabled && !ignoreChainEnabled) {
            return false;
          }

          for (const [key, value] of Object.entries(keyInfo.insensitive)) {
            for (const chainInfo of chainInfos) {
              try {
                const hexAddress =
                  KeyRingService.getAddressHexStringFromKeyInfo(
                    chainInfo,
                    keyInfo,
                    key,
                    value,
                    true
                  );

                if (
                  hexAddress.includes(
                    searchText.replace("0x", "").toLowerCase()
                  )
                ) {
                  return true;
                }
              } catch {
                // noop
              }
            }
          }
        });
      }
    }

    if (searchText.length >= 3) {
      const isHex = (() => {
        if (searchText.startsWith("0x")) {
          return true;
        }
        try {
          const s = Buffer.from(searchText, "hex");
          return s.toString().toLowerCase() === searchText.toLowerCase();
        } catch {
          return false;
        }
      })();

      if (!isHex) {
        let targetChainInfos: ChainInfo[] = (() => {
          const i = searchText.indexOf("1");
          if (i < 0) {
            return [];
          }
          const prefix = searchText.slice(0, i);
          const result: ChainInfo[] = [];
          for (const chainInfo of this.chainsService.getChainInfos()) {
            if (chainInfo.bech32Config?.bech32PrefixAccAddr === prefix) {
              result.push(chainInfo);
            }
          }
          return result;
        })();

        bech32AddressSearchKeyInfos = keyInfos.filter((keyInfo) => {
          if (!ignoreChainEnabled) {
            targetChainInfos = targetChainInfos.filter((chainInfo) => {
              return this.chainsUIService.isEnabled(
                keyInfo.id,
                chainInfo.chainId
              );
            });
          }

          const chainInfos = (() => {
            if (ignoreChainEnabled) {
              return this.chainsService.getChainInfos();
            }
            return targetChainInfos.length > 0
              ? targetChainInfos
              : (() => {
                  const modularChainInfos =
                    this.chainsUIService.enabledModularChainInfosForVault(
                      keyInfo.id
                    );
                  // TODO: 다른 체인도 지원하기
                  return modularChainInfos
                    .filter((c) => "cosmos" in c)
                    .map((c) => {
                      if (!("cosmos" in c)) {
                        throw new Error("Unsupported chain");
                      }
                      return c.cosmos;
                    });
                })();
          })();

          for (const chainInfo of chainInfos) {
            for (const [key, value] of Object.entries(keyInfo.insensitive)) {
              try {
                const isEVM = KeyRingService.isEthermintLike(chainInfo);

                const hexAddress =
                  KeyRingService.getAddressHexStringFromKeyInfo(
                    chainInfo,
                    keyInfo,
                    key,
                    value,
                    isEVM
                  );

                if (chainInfo.bech32Config == null) {
                  return false;
                }

                const bech32Address = this.getKeySearchBech32FromHex(
                  chainInfo.bech32Config.bech32PrefixAccAddr,
                  hexAddress
                );
                if (bech32Address.includes(searchText.toLowerCase())) {
                  return true;
                }
              } catch {
                // noop
              }
            }
          }
        });
      }
    }

    const exists = new Map<string, boolean>();
    for (const keyInfo of nameSearchKeyInfos) {
      exists.set(keyInfo.id, true);
    }
    for (const keyInfo of bech32AddressSearchKeyInfos) {
      exists.set(keyInfo.id, true);
    }
    for (const keyInfo of hexAddressSearchKeyInfos) {
      exists.set(keyInfo.id, true);
    }

    return keyInfos.filter((keyInfo) => exists.get(keyInfo.id));
  }

  protected getKeySearchBech32FromHex(prefix: string, hex: string): string {
    const key = `${prefix}/${hex}`;
    const cache = this.cacheKeySearchHexToBech32.get(key);
    if (cache) {
      return cache;
    }
    const value = new Bech32Address(Buffer.from(hex, "hex")).toBech32(prefix);
    this.cacheKeySearchHexToBech32.set(key, value);
    return value;
  }

  protected static getAddressHexStringFromKeyInfo(
    chainInfo: ChainInfo,
    keyInfo: KeyInfo,
    key: string,
    value: PlainObject | Primitive | undefined,
    isEVM: boolean
  ): string {
    let publicKeyText: string = "";
    if (keyInfo.type === "ledger") {
      if (
        value &&
        typeof value === "object" &&
        value["pubKey"] &&
        typeof value["pubKey"] === "string"
      ) {
        publicKeyText = value["pubKey"];
      }
    } else if (
      typeof value === "string" &&
      keyInfo.type === "private-key" &&
      key === "publicKey"
    ) {
      publicKeyText = value;
    } else if (
      typeof value === "string" &&
      keyInfo.type === "mnemonic" &&
      key.startsWith("pubKey-m/")
    ) {
      // if mnemonic
      const purpose = DEFAULT_BIP44_PURPOSE; // modularChainInfo(bitcoin 등)가 아닌 경우, 기본적으로 44' 경로를 사용
      const coinType = (() => {
        const coinTypeTag = `keyRing-${
          ChainIdHelper.parse(chainInfo.chainId).identifier
        }-coinType`;

        if (keyInfo.insensitive[coinTypeTag]) {
          return keyInfo.insensitive[coinTypeTag] as number;
        }

        return chainInfo.bip44.coinType;
      })();

      const bip44Path = keyInfo.insensitive["bip44Path"] as
        | BIP44HDPath
        | undefined;
      if (
        bip44Path &&
        key ===
          `pubKey-m/${purpose}'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
      ) {
        publicKeyText = value;
      }
    }
    if (!publicKeyText) {
      throw new Error("no public key text");
    }
    const publicKey = new PubKeySecp256k1(
      Buffer.from(publicKeyText.replace("0x", ""), "hex")
    );
    const address = isEVM
      ? publicKey.getEthAddress()
      : publicKey.getCosmosAddress();
    return Buffer.from(address).toString("hex").toLowerCase();
  }

  static parseBIP44Path(bip44Path: string): {
    purpose: number;
    coinType: number;
    path: BIP44HDPath;
  } {
    const metches = RegExp(/^m\/(\d+)'\/(\d+)'\/(\d+)'\/(\d+)\/(\d+)$/i).exec(
      bip44Path
    );
    if (!metches) {
      throw new Error("Invalid BIP44 hd path");
    }
    return {
      purpose: +metches[1],
      coinType: +metches[2],
      path: {
        account: +metches[3],
        change: +metches[4],
        addressIndex: +metches[5],
      },
    };
  }

  protected static validateBIP44Path(bip44Path: BIP44HDPath): void {
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

  static isEthermintLike(chainInfo: ChainInfo): boolean {
    return (
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign")
    );
  }
}
