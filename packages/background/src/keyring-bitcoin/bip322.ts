import * as bitcoin from "bitcoinjs-lib";

/**
 * https://github.com/ACken2/bip322-js/blob/main/src/BIP322.ts
 * use the existing the bip322-js file with some modification, use the file directly instead of install the whole package,
 * because the package will introduce too many dependencies.
 * Class that handles BIP-322 related operations.
 */
export class BIP322 {
  // BIP322 message tag
  static TAG = Buffer.from("BIP0322-signed-message");

  /**
   * Compute the message hash as specified in the BIP-322.
   * The standard is specified in BIP-340 as:
   *      The function hashtag(x) where tag is a UTF-8 encoded tag name and x is a byte array returns the 32-byte hash SHA256(SHA256(tag) || SHA256(tag) || x).
   * @param message Message to be hashed
   * @returns Hashed message
   */
  public static hashMessage(message: string): Buffer {
    // Compute the message hash - SHA256(SHA256(tag) || SHA256(tag) || message)
    const { sha256 } = bitcoin.crypto;
    const tagHash = sha256(this.TAG);
    const result = sha256(
      Buffer.concat([tagHash, tagHash, Buffer.from(message)])
    );
    return result;
  }

  /**
   * Build a to_spend transaction using simple signature in accordance to the BIP-322.
   * @param message Message to be signed using BIP-322
   * @param scriptPublicKey The script public key for the signing wallet
   * @returns Bitcoin transaction that correspond to the to_spend transaction
   */
  public static buildToSpendTx(
    message: string,
    scriptPublicKey: Buffer
  ): bitcoin.Transaction {
    // Create PSBT object for constructing the transaction
    const psbt = new bitcoin.Psbt();
    // Set default value for nVersion and nLockTime
    psbt.setVersion(0); // nVersion = 0
    psbt.setLocktime(0); // nLockTime = 0
    // Compute the message hash - SHA256(SHA256(tag) || SHA256(tag) || message)
    const messageHash = this.hashMessage(message);
    // Construct the scriptSig - OP_0 PUSH32[ message_hash ]
    const OP_0_CODE = 0x00; // OP_0
    const PUSH32_CODE = 0x20; // PUSH32
    const scriptSigPartOne = new Uint8Array([OP_0_CODE, PUSH32_CODE]); // OP_0 PUSH32
    const scriptSig = new Uint8Array(
      scriptSigPartOne.length + messageHash.length
    );
    scriptSig.set(scriptSigPartOne);
    scriptSig.set(messageHash, scriptSigPartOne.length);
    // Set the input
    psbt.addInput({
      hash: "0".repeat(64), // vin[0].prevout.hash = 0000...000
      index: 0xffffffff, // vin[0].prevout.n = 0xFFFFFFFF
      sequence: 0, // vin[0].nSequence = 0
      finalScriptSig: Buffer.from(scriptSig), // vin[0].scriptSig = OP_0 PUSH32[ message_hash ]
      witnessScript: Buffer.from([]), // vin[0].scriptWitness = []
    });
    // Set the output
    psbt.addOutput({
      value: 0, // vout[0].nValue = 0
      script: scriptPublicKey, // vout[0].scriptPubKey = message_challenge
    });
    // Return transaction
    return psbt.extractTransaction();
  }

  /**
   * Build a to_sign transaction using simple signature in accordance to the BIP-322.
   * @param toSpendTxId Transaction ID of the to_spend transaction as constructed by buildToSpendTx
   * @param witnessScript The script public key for the signing wallet, or the redeemScript for P2SH-P2WPKH address
   * @param isRedeemScript Set to true if the provided witnessScript is a redeemScript for P2SH-P2WPKH address, default to false
   * @param tapInternalKey Used to set the taproot internal public key of a taproot signing address when provided, default to undefined
   * @returns Ready-to-be-signed bitcoinjs.Psbt transaction
   */
  public static buildToSignTx(
    toSpendTxId: string,
    witnessScript: Buffer,
    isRedeemScript: boolean = false,
    tapInternalKey?: Buffer
  ): bitcoin.Psbt {
    // Create PSBT object for constructing the transaction
    const psbt = new bitcoin.Psbt();
    // Set default value for nVersion and nLockTime
    psbt.setVersion(0); // nVersion = 0
    psbt.setLocktime(0); // nLockTime = 0
    // Set the input
    psbt.addInput({
      hash: toSpendTxId, // vin[0].prevout.hash = to_spend.txid
      index: 0, // vin[0].prevout.n = 0
      sequence: 0, // vin[0].nSequence = 0
      witnessUtxo: {
        script: witnessScript,
        value: 0,
      },
    });
    // Set redeemScript as witnessScript if isRedeemScript
    if (isRedeemScript) {
      psbt.updateInput(0, {
        redeemScript: witnessScript,
      });
    }
    // Set tapInternalKey if provided
    if (tapInternalKey) {
      psbt.updateInput(0, {
        tapInternalKey: tapInternalKey,
      });
    }
    // Set the output
    const OP_RETURN_CODE = 0x6a; // OP_RETURN
    psbt.addOutput({
      value: 0, // vout[0].nValue = 0
      script: Buffer.from([OP_RETURN_CODE]), // vout[0].scriptPubKey = OP_RETURN
    });
    return psbt;
  }

  /**
   * Encode witness stack in a signed BIP-322 PSBT into its base-64 encoded format.
   * @param signedPsbt Signed PSBT
   * @returns Base-64 encoded witness data
   */
  public static encodeWitness(signedPsbt: bitcoin.Psbt): string {
    // Obtain the signed witness data
    const witness = signedPsbt.data.inputs[0].finalScriptWitness;
    // Check if the witness data is present
    if (!witness) {
      throw new Error("Cannot encode empty witness stack.");
    }
    // Return the base-64 encoded witness stack
    return witness.toString("base64");
  }
}
