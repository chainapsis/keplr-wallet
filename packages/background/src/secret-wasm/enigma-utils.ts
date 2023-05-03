import { generateKeyPair, sharedKey as x25519 } from "curve25519-js";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import * as miscreant from "miscreant";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

const cryptoProvider = new miscreant.PolyfillCryptoProvider();

export interface EncryptionUtils {
  getPubkey: () => Promise<Uint8Array>;
  decrypt: (ciphertext: Uint8Array, nonce: Uint8Array) => Promise<Uint8Array>;
  encrypt: (contractCodeHash: string, msg: object) => Promise<Uint8Array>;
  getTxEncryptionKey: (nonce: Uint8Array) => Promise<Uint8Array>;
}

const hkdfSalt: Uint8Array = new Uint8Array(
  Buffer.from(
    "000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d",
    "hex"
  )
);

const mainnetConsensusIoPubKey = new Uint8Array(
  Buffer.from("79++5YOHfm0SwhlpUDClv7cuCjq9xBZlWqSjDJWkRG8=", "base64")
);

const mainnetChainIds = new Set(["secret-2", "secret-3", "secret-4"]);

export class EnigmaUtils implements EncryptionUtils {
  private readonly seed: Uint8Array;
  private readonly privkey: Uint8Array;
  public readonly pubkey: Uint8Array;
  private consensusIoPubKey: Uint8Array = new Uint8Array(); // cache

  public constructor(private url: string, seed?: Uint8Array, chainId?: string) {
    if (!seed) {
      this.seed = EnigmaUtils.GenerateNewSeed();
    } else {
      if (seed.length !== 32) {
        throw new Error("encryptionSeed must be a Uint8Array of length 32");
      }
      this.seed = seed;
    }

    const { privkey, pubkey } = EnigmaUtils.GenerateNewKeyPairFromSeed(
      this.seed
    );
    this.privkey = privkey;
    this.pubkey = pubkey;

    // todo: add this again post upgrade
    if (chainId && mainnetChainIds.has(chainId)) {
      // Major speedup
      // TODO: not sure if this is the best approach for detecting mainnet
      this.consensusIoPubKey = mainnetConsensusIoPubKey;
    }
  }

  public static GenerateNewKeyPair(): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
  } {
    return EnigmaUtils.GenerateNewKeyPairFromSeed(
      EnigmaUtils.GenerateNewSeed()
    );
  }

  public static GenerateNewSeed(): Uint8Array {
    return EnigmaUtils.secureRandom(32);
  }

  private static secureRandom(count: number): Uint8Array {
    const nativeArr = new Uint8Array(count);
    crypto.getRandomValues(nativeArr);

    return nativeArr;
  }

  public static GenerateNewKeyPairFromSeed(seed: Uint8Array): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
  } {
    const { private: privkey, public: pubkey } = generateKeyPair(seed);
    return { privkey, pubkey };
  }

  private async getConsensusIoPubKey(): Promise<Uint8Array> {
    if (this.consensusIoPubKey.length === 32) {
      return this.consensusIoPubKey;
    }

    const response = await simpleFetch<{ result: { TxKey: string } }>(
      this.url,
      "/reg/tx-key"
    );

    this.consensusIoPubKey = new Uint8Array(
      Buffer.from(response.data.result.TxKey, "base64")
    );

    return this.consensusIoPubKey;
  }

  public async getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array> {
    const consensusIoPubKey = await this.getConsensusIoPubKey();

    const txEncryptionIkm = x25519(this.privkey, consensusIoPubKey);
    return hkdf(
      sha256,
      Uint8Array.from([...txEncryptionIkm, ...nonce]),
      hkdfSalt,
      "",
      32
    );
  }

  public async encrypt(
    contractCodeHash: string,
    msg: object
  ): Promise<Uint8Array> {
    const nonce = EnigmaUtils.secureRandom(32);

    const txEncryptionKey = await this.getTxEncryptionKey(nonce);

    const siv = await miscreant.SIV.importKey(
      txEncryptionKey,
      "AES-SIV",
      cryptoProvider
    );

    const plaintext = new TextEncoder().encode(
      contractCodeHash + JSON.stringify(msg)
    );

    const ciphertext = await siv.seal(plaintext, [new Uint8Array()]);

    // ciphertext = nonce(32) || wallet_pubkey(32) || ciphertext
    return Uint8Array.from([...nonce, ...this.pubkey, ...ciphertext]);
  }

  public async decrypt(
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    if (!ciphertext?.length) {
      return new Uint8Array();
    }

    const txEncryptionKey = await this.getTxEncryptionKey(nonce);

    const siv = await miscreant.SIV.importKey(
      txEncryptionKey,
      "AES-SIV",
      cryptoProvider
    );

    return await siv.open(ciphertext, [new Uint8Array()]);
  }

  getPubkey(): Promise<Uint8Array> {
    return Promise.resolve(this.pubkey);
  }
}
