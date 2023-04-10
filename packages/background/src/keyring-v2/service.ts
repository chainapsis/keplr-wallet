import { VaultService, Vault } from "../vault";
import { BIP44HDPath, KeyInfo, KeyRing, KeyRingStatus } from "./types";
import { Env } from "@keplr-wallet/router";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { ChainsService } from "../chains";
import { autorun, makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { InteractionService } from "../interaction";
import { ChainInfo } from "@keplr-wallet/types";

export class KeyRingService {
  @observable
  protected _selectedVaultId: string | undefined = undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly interactionService: InteractionService,
    protected readonly vaultService: VaultService,
    protected readonly keyRings: KeyRing[]
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
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
  }

  lockKeyRing(): void {
    this.vaultService.lock();
  }

  async ensureUnlockInteractive(
    env: Env,
    remainUIAfterInteraction: boolean = false
  ): Promise<void> {
    if (this.vaultService.isLocked) {
      await this.interactionService.waitApprove(env, "/unlock", "unlock", {
        remainUIAfterInteraction,
      });
    }
  }

  async unlockKeyRing(password: string): Promise<void> {
    await this.vaultService.unlock(password);
  }

  get keyRingStatus(): KeyRingStatus {
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

  finalizeMnemonicKeyCoinType(
    vaultId: string,
    chainId: string,
    coinType: number
  ): void {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    if (
      chainInfo.bip44.coinType !== coinType &&
      !(chainInfo.alternativeBIP44s ?? []).find(
        (path) => path.coinType !== coinType
      )
    ) {
      throw new Error("Coin type is not associated to chain");
    }

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    if (vault.insensitive["keyRingType"] !== "mnemonic") {
      throw new Error("Key is not from mnemonic");
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

  async createMnemonicKeyRing(
    env: Env,
    mnemonic: string,
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

    const keyRing = this.getKeyRing("mnemonic");
    const vaultData = await keyRing.createKeyRingVault(
      env,
      mnemonic,
      bip44Path
    );

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
    return id;
  }

  async createLedgerKeyRing(
    env: Env,
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
    const vaultData = await keyRing.createKeyRingVault(
      env,
      pubKey,
      app,
      bip44Path
    );

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
    return id;
  }

  getPubKeySelected(env: Env, chainId: string): Promise<PubKeySecp256k1> {
    return this.getPubKey(env, chainId, this.selectedVaultId);
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

  signSelected(
    env: Env,
    chainId: string,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<Uint8Array> {
    return this.sign(env, chainId, this.selectedVaultId, data, digestMethod);
  }

  getPubKey(
    env: Env,
    chainId: string,
    vaultId: string
  ): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    const coinType = (() => {
      if (vault.insensitive[coinTypeTag]) {
        return vault.insensitive[coinTypeTag] as number;
      }

      return chainInfo.bip44.coinType;
    })();

    return this.getPubKeyWithVault(env, vault, coinType, chainInfo);
  }

  sign(
    env: Env,
    chainId: string,
    vaultId: string,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<Uint8Array> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    const coinTypeTag = `keyRing-${
      ChainIdHelper.parse(chainId).identifier
    }-coinType`;

    const coinType = (() => {
      if (vault.insensitive[coinTypeTag]) {
        return vault.insensitive[coinTypeTag] as number;
      }

      return chainInfo.bip44.coinType;
    })();

    const signature = this.signWithVault(
      env,
      vault,
      coinType,
      data,
      digestMethod,
      chainInfo
    );

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      coinTypeTag: coinType,
    });

    return signature;
  }

  getPubKeyWithVault(
    env: Env,
    vault: Vault,
    coinType: number,
    chainInfo: ChainInfo
  ): Promise<PubKeySecp256k1> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(keyRing.getPubKey(env, vault, coinType, chainInfo));
  }

  signWithVault(
    env: Env,
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256",
    chainInfo: ChainInfo
  ): Promise<Uint8Array> {
    if (this.vaultService.isLocked) {
      throw new Error("KeyRing is locked");
    }

    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.sign(env, vault, coinType, data, digestMethod, chainInfo)
    );
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
}
