import { EnigmaUtils } from "secretjs";
import { KeyRingKeeper } from "../keyring/keeper";
import { ChainsKeeper } from "../chains/keeper";
import { Crypto } from "../keyring/crypto";
import { KVStore } from "../../common/kvstore";
import { ChainInfo } from "../chains";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";

const Buffer = require("buffer/").Buffer;

export class SecretWasmKeeper {
  protected cacheEnigmaUtils: Map<string, EnigmaUtils> = new Map();

  constructor(
    private readonly kvStore: KVStore,
    private readonly chainsKeeper: ChainsKeeper,
    private readonly keyRingKeeper: KeyRingKeeper
  ) {}

  async getPubkey(chainId: string): Promise<Uint8Array> {
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    const keyRingType = await this.keyRingKeeper.getKeyRingType();
    if (keyRingType === "none") {
      throw new Error("Key ring is not initialized");
    }

    const seed = await this.getSeed(chainInfo);

    const utils = this.getEnigmaUtils(chainInfo, seed);
    return utils.pubkey;
  }

  async encrypt(
    chainId: string,
    contractCodeHash: string,
    msg: object
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    const keyRingType = await this.keyRingKeeper.getKeyRingType();
    if (keyRingType === "none") {
      throw new Error("Key ring is not initialized");
    }

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
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    const keyRingType = await this.keyRingKeeper.getKeyRingType();
    if (keyRingType === "none") {
      throw new Error("Key ring is not initialized");
    }

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

    // TODO: Handle the rest config.
    const utils = new EnigmaUtils(chainInfo.rest, seed);
    this.cacheEnigmaUtils.set(key, utils);

    return utils;
  }

  private async getSeed(chainInfo: ChainInfo): Promise<Uint8Array> {
    const key = await this.keyRingKeeper.getKey(chainInfo.chainId);

    const storeKey = `seed-${chainInfo.chainId}-${new AccAddress(
      key.address,
      chainInfo.bech32Config.bech32PrefixAccAddr
    ).toBech32()}`;

    const cached = await this.kvStore.get(storeKey);
    if (cached) {
      return Buffer.from(cached, "hex");
    }

    const seed = Crypto.sha256(
      Buffer.from(
        await this.keyRingKeeper.sign(
          chainInfo.chainId,
          Buffer.from(
            JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/camelcase
              account_number: 0,
              // eslint-disable-next-line @typescript-eslint/camelcase
              chain_id: chainInfo.chainId,
              fee: [],
              memo:
                "Create Keplr Secret encryption key. Only approve requests by Keplr.",
              msgs: [],
              sequence: 0
            })
          )
        )
      )
    );

    await this.kvStore.set(storeKey, Buffer.from(seed).toString("hex"));

    return seed;
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
}
