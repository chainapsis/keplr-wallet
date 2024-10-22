import { EnigmaUtils } from "./enigma-utils";
import { ChainsService } from "../chains";
import { KVStore } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { Hash } from "@keplr-wallet/crypto";
import { autorun, observable, runInAction, toJS } from "mobx";

export class SecretWasmService {
  protected cacheEnigmaUtils: Map<string, EnigmaUtils> = new Map();
  // Key: `${chainInfo.chainIdentifier}-${bech32Address}`
  @observable
  protected readonly seedMap: Map<string, string> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly keyRingCosmosService: KeyRingCosmosService
  ) {}

  async init(): Promise<void> {
    const migrated = await this.kvStore.get("migration/v2");
    if (!migrated) {
      // TODO

      await this.kvStore.set("migration/v2", true);
    }

    const saved = await this.kvStore.get<Record<string, string | undefined>>(
      "seedMap/v2"
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          if (value) {
            this.seedMap.set(key, value);
          }
        }
      });
    }

    autorun(() => {
      const js = toJS(this.seedMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, string | undefined>>("seedMap/v2", obj);
    });

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = () => {
    this.cacheEnigmaUtils = new Map();
  };

  async getPubkey(chainId: string): Promise<Uint8Array> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    const seed = await this.getSeed(chainInfo);

    const utils = this.getEnigmaUtils(chainInfo, seed);
    return utils.pubkey;
  }

  async getTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsService.getChainInfoOrThrow(chainId);

    const seed = await this.getSeed(chainInfo);

    const utils = this.getEnigmaUtils(chainInfo, seed);
    return utils.getTxEncryptionKey(nonce);
  }

  async isNewApi(chainId: string): Promise<boolean> {
    const chainInfo = await this.chainsService.getChainInfoOrThrow(chainId);

    // XXX: Keplr should generate the seed deterministically according to the account.
    // Otherwise, it will lost the encryption/decryption key if Keplr is uninstalled or local storage is cleared.
    // For now, use the signature of some string to generate the seed.
    // It need to more research.
    const seed = await this.getSeed(chainInfo);

    const utils = this.getEnigmaUtils(chainInfo, seed);
    return utils.isNewApi;
  }

  async encrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsService.getChainInfoOrThrow(chainId);

    // XXX: Keplr should generate the seed deterministically according to the account.
    // Otherwise, it will lost the encryption/decryption key if Keplr is uninstalled or local storage is cleared.
    // For now, use the signature of some string to generate the seed.
    // It need to more research.
    const seed = await this.getSeed(chainInfo);

    const utils = this.getEnigmaUtils(chainInfo, seed);

    return await utils.encrypt(contractCodeHash, msg);
  }

  async decrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsService.getChainInfoOrThrow(chainId);

    // XXX: Keplr should generate the seed deterministically according to the account.
    // Otherwise, it will lost the encryption/decryption key if Keplr is uninstalled or local storage is cleared.
    // For now, use the signature of some string to generate the seed.
    // It need to more research.
    const seed = await this.getSeed(chainInfo);

    const utils = this.getEnigmaUtils(chainInfo, seed);

    return await utils.decrypt(ciphertext, nonce);
  }

  private getEnigmaUtils(chainInfo: ChainInfo, seed: Uint8Array): EnigmaUtils {
    const key = `${chainInfo.chainId}-${Buffer.from(seed).toString("hex")}`;

    if (this.cacheEnigmaUtils.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.cacheEnigmaUtils.get(key)!;
    }

    const utils = new EnigmaUtils(chainInfo.rest, seed, chainInfo.rest);
    this.cacheEnigmaUtils.set(key, utils);

    return utils;
  }

  protected async getSeed(chainInfo: ChainInfo): Promise<Uint8Array> {
    const key = await this.keyRingCosmosService.getKeySelected(
      chainInfo.chainId
    );

    return await this.getSeedInner(chainInfo, key);
  }

  protected async getSeedInner(
    chainInfo: ChainInfo,
    key: {
      readonly bech32Address: string;
      readonly isNanoLedger: boolean;
      readonly isKeystone: boolean;
    }
  ): Promise<Uint8Array> {
    const cacheKey = `seed-${
      ChainIdHelper.parse(chainInfo.chainId).identifier
    }-${key.bech32Address}`;

    const cached = this.seedMap.get(cacheKey);
    if (cached) {
      return Buffer.from(cached, "hex");
    }

    const seed = await (async () => {
      if (key.isNanoLedger || key.isKeystone) {
        const arr = new Uint8Array(32);
        crypto.getRandomValues(arr);
        return arr;
      }

      return Hash.sha256(
        await this.keyRingCosmosService.legacySignArbitraryInternal(
          chainInfo.chainId,
          "Create Keplr Secret encryption key. Only approve requests by Keplr."
        )
      );
    })();

    this.seedMap.set(cacheKey, Buffer.from(seed).toString("hex"));

    return seed;
  }
}
