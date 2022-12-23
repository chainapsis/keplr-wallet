export interface SecretUtils {
  getPubkey: () => Promise<Uint8Array>;
  decrypt: (ciphertext: Uint8Array, nonce: Uint8Array) => Promise<Uint8Array>;
  encrypt: (
    contractCodeHash: string,
    msg: Record<string, unknown>
  ) => Promise<Uint8Array>;
  getTxEncryptionKey: (nonce: Uint8Array) => Promise<Uint8Array>;
}

export declare class EnigmaUtils implements SecretUtils {
  private readonly apiUrl;
  readonly seed: Uint8Array;
  private readonly privkey;
  readonly pubkey: Uint8Array;
  private consensusIoPubKey;
  constructor(apiUrl: string, seed?: Uint8Array);
  static GenerateNewKeyPair(): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
  };
  static GenerateNewSeed(): Uint8Array;
  static GenerateNewKeyPairFromSeed(
    seed: Uint8Array
  ): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
  };
  private getConsensusIoPubKey;
  getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array>;
  encrypt(
    contractCodeHash: string,
    msg: Record<string, unknown>
  ): Promise<Uint8Array>;
  decrypt(ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
  getPubkey(): Promise<Uint8Array>;
}
