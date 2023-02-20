import { VaultService, Vault } from "../vault";
import { KeyRing } from "./types";
import { Env } from "@keplr-wallet/router";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { ChainsService } from "../chains";
import { autorun, makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class KeyRingService {
  @observable
  protected _selectedVaultId: string | undefined = undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
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

  getKeyRingVaults(): Vault[] {
    return this.vaultService.getVaults("keyRing");
  }

  // Return selected vault id.
  // If selected vault doesn't exist for unknown reason, return undefined.
  get selectedVaultId(): string | undefined {
    if (
      this._selectedVaultId &&
      this.vaultService.getVault("keyRing", this._selectedVaultId)
    ) {
      return this._selectedVaultId;
    }
    return undefined;
  }

  async createMnemonicKeyRing(
    env: Env,
    mnemonic: string,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    },
    name: string,
    password?: string
  ): Promise<string> {
    if (!this.vaultService.isSignedUp) {
      if (!password) {
        throw new Error("Must provide password to sign in to vault");
      }

      await this.vaultService.signUp(password);
    }

    const keyRing = this.getKeyRing("mnemonic");
    const vaultData = await keyRing.createKeyRingVault(
      env,
      mnemonic,
      bip44Path
    );

    return this.vaultService.addVault(
      "keyRing",
      {
        ...vaultData.insensitive,
        keyRingName: name,
        keyRingType: keyRing.supportedKeyRingType(),
      },
      vaultData.sensitive
    );
  }

  getPubKeySelected(env: Env, chainId: string): Promise<PubKeySecp256k1> {
    if (!this.selectedVaultId) {
      throw new Error("KeyRing not selected");
    }

    return this.getPubKey(env, chainId, this.selectedVaultId);
  }

  getKeyRingNameSelected(): string {
    if (!this.selectedVaultId) {
      throw new Error("KeyRing not selected");
    }

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
    if (!this.selectedVaultId) {
      throw new Error("KeyRing not selected");
    }

    return this.sign(env, chainId, this.selectedVaultId, data, digestMethod);
  }

  getPubKey(
    env: Env,
    chainId: string,
    vaultId: string
  ): Promise<PubKeySecp256k1> {
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

    return this.getPubKeyWithVault(env, vault, coinType);
  }

  sign(
    env: Env,
    chainId: string,
    vaultId: string,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<Uint8Array> {
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
      digestMethod
    );

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      coinTypeTag: coinType,
    });

    return signature;
  }

  getPubKeyWithVault(
    env: Env,
    vault: Vault,
    coinType: number
  ): Promise<PubKeySecp256k1> {
    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(keyRing.getPubKey(env, vault, coinType));
  }

  signWithVault(
    env: Env,
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<Uint8Array> {
    const keyRing = this.getVaultKeyRing(vault);

    return Promise.resolve(
      keyRing.sign(env, vault, coinType, data, digestMethod)
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
}
