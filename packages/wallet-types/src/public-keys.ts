/**
 * The base representation of the PublicKey object.
 *
 * Since in the wallet multiple different types of crypto keys are possible in the system this is a base representation
 * of the public key.
 *
 * Based on the type field a concrete version of the public key can be retrieved
 */
export interface PublicKey {
  // TODO(EJF): Need to include BLS key support

  /**
   * The type id for the public key
   */
  readonly type: "tendermint/PubKeySecp256k1" | "tendermint/PubKeyEd25519";

  /**
   * The value of the public key. The type of this will vary depending on the concrete type of the public key
   */
  readonly value: any;
}

/**
 * The concrete version of the Ed25519 Public Key
 */
export interface Ed25519PublicKey extends PublicKey {
  /**
   * The type id for the public key
   */
  readonly type: "tendermint/PubKeyEd25519";

  /**
   * The binary encoded public key
   */
  readonly value: Uint8Array;
}

/**
 * The concrete version of the Secp256K1 Public Key
 */
export interface Secp256k1PublicKey extends PublicKey {
  /**
   * The type id for the public key
   */
  readonly type: "tendermint/PubKeySecp256k1";

  /**
   * The binary encoded public key (compressed, 33 bytes)
   */
  readonly value: Uint8Array;
}

/**
 * Determines if the input public key if a Secp256k1 public key
 *
 * @param publicKey The input public key to check
 */
export function isSecp256k1PublicKey(
  publicKey: PublicKey
): publicKey is Secp256k1PublicKey {
  return publicKey.type === "tendermint/PubKeySecp256k1";
}

/**
 * Determines if the input public key if a Ed25519 public key
 *
 * @param publicKey The input public key to check
 */

export function isEd25519PublicKey(
  publicKey: PublicKey
): publicKey is Ed25519PublicKey {
  return publicKey.type === "tendermint/PubKeyEd25519";
}
