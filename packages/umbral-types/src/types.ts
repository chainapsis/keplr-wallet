export interface UmbralEncryptionResult {
  cipherText: Uint8Array;
  capsule: Uint8Array;
}

export interface UmbralKeyFragment {
  data: Uint8Array;
}

/**
 * The interface that will be exposed in the window client
 */
export interface UmbralApi {
  /**
   * Get the associated umbral public key that was generated for this account
   *
   * @param chainId The target chain id
   */
  getPublicKey(chainId: string): Promise<Uint8Array>;

  /**
   * Get the associated umbral signing public key that was generated for this account
   *
   * @param chainId The target chain id
   */
  getSigningPublicKey(chainId: string): Promise<Uint8Array>;

  /**
   * Encrypt some data for use
   *
   * @param pubKey The pubKey we want to use to encrypt
   * @param plainTextBytes The bytes to be encrypted
   */
  encrypt(
    pubKey: Uint8Array,
    plainTextBytes: Uint8Array
  ): Promise<UmbralEncryptionResult>;

  /**
   * Create a set of key fragments
   *
   * @param chainId The target chain id
   * @param receiverPublicKey The receivers public key
   * @param threshold The threshold number of shares to recover
   * @param shares The total number of shares to generate
   */
  generateKeyFragments(
    chainId: string,
    receiverPublicKey: Uint8Array,
    threshold: number,
    shares: number
  ): Promise<UmbralKeyFragment[]>;

  /**
   * Decrypt a previously encrypted piece of data
   *
   * @param chainId The target chain id
   * @param capsuleBytes The capsule data
   * @param cipherTextBytes The cipher text to decrypt
   */
  decrypt(
    chainId: string,
    capsuleBytes: Uint8Array,
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array>;

  /**
   * Decrypt a piece of encrypted data with the capsule and capsule fragments
   *
   * @param chainId The target chain id
   * @param senderPublicKey The senders public key
   * @param capsule The capsule data
   * @param capsuleFragments The capsule fragments to combine
   * @param cipherTextBytes The cipher text bytes
   */
  decryptReEncrypted(
    chainId: string,
    senderPublicKey: Uint8Array,
    capsule: Uint8Array,
    capsuleFragments: Uint8Array[],
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array>;

  /**
   * Verify a capsule fragment
   *
   * @param capsuleFragment The capsule fragment to verify
   * @param capsule The capsule that the fragment refers to
   * @param verifyingPublicKey The verifying public key
   * @param senderPublicKey The sender public key
   * @param receiverPublicKey The receiver public key
   */
  verifyCapsuleFragment(
    capsuleFragment: Uint8Array,
    capsule: Uint8Array,
    verifyingPublicKey: Uint8Array,
    senderPublicKey: Uint8Array,
    receiverPublicKey: Uint8Array
  ): Promise<boolean>;
}
