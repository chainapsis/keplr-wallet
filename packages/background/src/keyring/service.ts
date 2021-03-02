import { delay, inject, singleton } from "tsyringe";
import { TYPES } from "../types";

import {
  Key,
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected,
} from "./keyring";

import { Bech32Address } from "@keplr-wallet/cosmos";
import { BIP44HDPath } from "./types";

import { KVStore } from "@keplr-wallet/common";

import { ChainsService } from "../chains";
import { LedgerService } from "../ledger";
import { BIP44, ChainInfo } from "@keplr-wallet/types";
import { APP_PORT, Env, WEBPAGE_PORT } from "@keplr-wallet/router";
import { InteractionService } from "../interaction";
import { PermissionService } from "../permission";

import { EnableKeyRingMsg } from "./messages";

import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  AminoSignResponse,
  StdSignDoc,
} from "@cosmjs/launchpad";
import { DirectSignResponse, makeSignBytes } from "@cosmjs/proto-signing";

import { RNG } from "@keplr-wallet/crypto";
import { cosmos } from "@keplr-wallet/cosmos";

@singleton()
export class KeyRingService {
  private readonly keyRing: KeyRing;

  constructor(
    @inject(TYPES.KeyRingStore)
    kvStore: KVStore,
    @inject(TYPES.ChainsEmbedChainInfos)
    embedChainInfos: ChainInfo[],
    @inject(delay(() => InteractionService))
    protected readonly interactionService: InteractionService,
    @inject(delay(() => ChainsService))
    public readonly chainsService: ChainsService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService,
    @inject(LedgerService)
    ledgerService: LedgerService,
    @inject(TYPES.RNG)
    protected readonly rng: RNG
  ) {
    this.keyRing = new KeyRing(embedChainInfos, kvStore, ledgerService, rng);
  }

  async restore(): Promise<{
    status: KeyRingStatus;
    type: string;
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
  }> {
    await this.keyRing.restore();
    return {
      status: this.keyRing.status,
      type: this.keyRing.type,
      multiKeyStoreInfo: this.keyRing.getMultiKeyStoreInfo(),
    };
  }

  async enable(env: Env): Promise<KeyRingStatus> {
    if (this.keyRing.status === KeyRingStatus.EMPTY) {
      throw new Error("key doesn't exist");
    }

    if (this.keyRing.status === KeyRingStatus.NOTLOADED) {
      await this.keyRing.restore();
    }

    if (this.keyRing.status === KeyRingStatus.LOCKED) {
      await this.interactionService.waitApprove(
        env,
        "/unlock",
        EnableKeyRingMsg.type(),
        {}
      );
      return this.keyRing.status;
    }

    return this.keyRing.status;
  }

  get keyRingStatus(): KeyRingStatus {
    return this.keyRing.status;
  }

  async deleteKeyRing(
    index: number,
    password: string
  ): Promise<{
    multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
    status: KeyRingStatus;
  }> {
    const multiKeyStoreInfo = await this.keyRing.deleteKeyRing(index, password);
    return {
      multiKeyStoreInfo,
      status: this.keyRing.status,
    };
  }

  async showKeyRing(index: number, password: string): Promise<string> {
    return await this.keyRing.showKeyRing(index, password);
  }

  async createMnemonicKey(
    mnemonic: string,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyRingStatus> {
    // TODO: Check mnemonic checksum.
    await this.keyRing.createMnemonicKey(mnemonic, password, meta, bip44HDPath);
    return this.keyRing.status;
  }

  async createPrivateKey(
    privateKey: Uint8Array,
    password: string,
    meta: Record<string, string>
  ): Promise<KeyRingStatus> {
    // TODO: Check mnemonic checksum.
    await this.keyRing.createPrivateKey(privateKey, password, meta);
    return this.keyRing.status;
  }

  async createLedgerKey(
    env: Env,
    password: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<KeyRingStatus> {
    await this.keyRing.createLedgerKey(env, password, meta, bip44HDPath);
    return this.keyRing.status;
  }

  lock(): KeyRingStatus {
    this.keyRing.lock();
    return this.keyRing.status;
  }

  async unlock(password: string): Promise<KeyRingStatus> {
    await this.keyRing.unlock(password);

    return this.keyRing.status;
  }

  async getKey(chainId: string): Promise<Key> {
    return this.keyRing.getKey(
      chainId,
      await this.chainsService.getChainCoinType(chainId)
    );
  }

  getKeyStoreMeta(key: string): string {
    return this.keyRing.getKeyStoreMeta(key);
  }

  getKeyRingType(): string {
    return this.keyRing.type;
  }

  async requestSignAmino(
    env: Env,
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    const coinType = await this.chainsService.getChainCoinType(chainId);

    const key = await this.keyRing.getKey(chainId, coinType);
    const bech32Address = new Bech32Address(key.address).toBech32(
      (await this.chainsService.getChainInfo(chainId)).bech32Config
        .bech32PrefixAccAddr
    );
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const newSignDoc = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        chainId,
        mode: "amino",
        signDoc,
        signer,
      }
    )) as StdSignDoc;

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        serializeSignDoc(newSignDoc)
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      await this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-end",
        {}
      );
    }
  }

  async requestSignDirect(
    env: Env,
    chainId: string,
    signer: string,
    signDoc: cosmos.tx.v1beta1.SignDoc
  ): Promise<DirectSignResponse> {
    const coinType = await this.chainsService.getChainCoinType(chainId);

    const key = await this.keyRing.getKey(chainId, coinType);
    const bech32Address = new Bech32Address(key.address).toBech32(
      (await this.chainsService.getChainInfo(chainId)).bech32Config
        .bech32PrefixAccAddr
    );
    if (signer !== bech32Address) {
      throw new Error("Signer mismatched");
    }

    const newSignDocBytes = (await this.interactionService.waitApprove(
      env,
      "/sign",
      "request-sign",
      {
        chainId,
        mode: "direct",
        signDocBytes: cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish(),
        signer,
      }
    )) as Uint8Array;

    const newSignDoc = cosmos.tx.v1beta1.SignDoc.decode(newSignDocBytes);

    try {
      const signature = await this.keyRing.sign(
        env,
        chainId,
        coinType,
        makeSignBytes(newSignDoc)
      );

      return {
        signed: newSignDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      await this.interactionService.dispatchEvent(
        APP_PORT,
        "request-sign-end",
        {}
      );
    }
  }

  async sign(
    env: Env,
    chainId: string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    return this.keyRing.sign(
      env,
      chainId,
      await this.chainsService.getChainCoinType(chainId),
      message
    );
  }

  async addMnemonicKey(
    mnemonic: string,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<MultiKeyStoreInfoWithSelected> {
    return this.keyRing.addMnemonicKey(mnemonic, meta, bip44HDPath);
  }

  async addPrivateKey(
    privateKey: Uint8Array,
    meta: Record<string, string>
  ): Promise<MultiKeyStoreInfoWithSelected> {
    return this.keyRing.addPrivateKey(privateKey, meta);
  }

  async addLedgerKey(
    env: Env,
    meta: Record<string, string>,
    bip44HDPath: BIP44HDPath
  ): Promise<MultiKeyStoreInfoWithSelected> {
    return this.keyRing.addLedgerKey(env, meta, bip44HDPath);
  }

  public async changeKeyStoreFromMultiKeyStore(
    index: number
  ): Promise<MultiKeyStoreInfoWithSelected> {
    try {
      return await this.keyRing.changeKeyStoreFromMultiKeyStore(index);
    } finally {
      await this.interactionService.dispatchEvent(
        WEBPAGE_PORT,
        "keystore-changed",
        {}
      );
    }
  }

  getMultiKeyStoreInfo(): MultiKeyStoreInfoWithSelected {
    return this.keyRing.getMultiKeyStoreInfo();
  }

  isKeyStoreCoinTypeSet(chainId: string): boolean {
    return this.keyRing.isKeyStoreCoinTypeSet(chainId);
  }

  async setKeyStoreCoinType(chainId: string, coinType: number): Promise<void> {
    await this.keyRing.setKeyStoreCoinType(chainId, coinType);
  }

  async getKeyStoreBIP44Selectables(
    chainId: string,
    paths: BIP44[]
  ): Promise<{ readonly path: BIP44; readonly bech32Address: string }[]> {
    if (this.isKeyStoreCoinTypeSet(chainId)) {
      return [];
    }

    const result = [];
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    for (const path of paths) {
      const key = await this.keyRing.getKeyFromCoinType(path.coinType);
      const bech32Address = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );

      result.push({
        path,
        bech32Address,
      });
    }

    return result;
  }
}
