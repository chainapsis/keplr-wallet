import { VaultService, PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { Buffer as NodeBuffer } from "buffer";
import {
  Hash,
  Mnemonic,
  PrivKeySecp256k1,
  PubKeyBitcoinCompatible,
  PubKeySecp256k1,
  toXOnly,
} from "@keplr-wallet/crypto";
import { Psbt, payments } from "bitcoinjs-lib";
import { taggedHash } from "bitcoinjs-lib/src/crypto";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

export class KeyRingMnemonicService {
  constructor(protected readonly vaultService: VaultService) {}

  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "mnemonic";
  }

  createKeyRingVault(
    mnemonic: string,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    if (!mnemonic || typeof mnemonic !== "string") {
      throw new Error("Invalid arguments");
    }

    // Validate mnemonic.
    // Checksome shouldn't be validated in this method.
    try {
      bip39.mnemonicToEntropy(mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    const masterSeed = Mnemonic.generateMasterSeedFromMnemonic(mnemonic);
    const masterSeedText = Buffer.from(masterSeed).toString("hex");

    return Promise.resolve({
      insensitive: {
        bip44Path,
      },
      sensitive: {
        masterSeedText,
        mnemonic,
      },
    });
  }

  getPubKey(vault: Vault, purpose: number, coinType: number): PubKeySecp256k1 {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const tag = `pubKey-m/${purpose}'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    if (vault.insensitive[tag]) {
      const pubKey = Buffer.from(vault.insensitive[tag] as string, "hex");
      return new PubKeySecp256k1(pubKey);
    }

    const privKey = this.getPrivKey(vault, purpose, coinType);

    const pubKey = privKey.getPubKey();

    const pubKeyText = Buffer.from(pubKey.toBytes()).toString("hex");
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });

    return pubKey;
  }

  getPubKeyBitcoin(
    vault: Vault,
    purpose: number,
    coinType: number
  ): PubKeyBitcoinCompatible {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const path = `m/${purpose}'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;
    const pubKeyTag = `pubKey-${path}`;
    const masterFingerprintTag = `masterFingerprint-${path}`;

    if (
      vault.insensitive[pubKeyTag] &&
      vault.insensitive[masterFingerprintTag]
    ) {
      const pubKey = Buffer.from(vault.insensitive[pubKeyTag] as string, "hex");
      const masterFingerprint = vault.insensitive[
        masterFingerprintTag
      ] as string;

      return new PubKeyBitcoinCompatible(pubKey, masterFingerprint, path);
    }

    const privKey = this.getPrivKey(vault, purpose, coinType);
    const pubKey = privKey.getBitcoinPubKey();

    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [pubKeyTag]: Buffer.from(pubKey.toBytes()).toString("hex"),
      [masterFingerprintTag]: pubKey.getMasterFingerprint(),
    });

    return pubKey;
  }

  sign(
    vault: Vault,
    purpose: number,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256" | "hash256" | "noop"
  ): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    const privKey = this.getPrivKey(vault, purpose, coinType);

    let digest = new Uint8Array();
    switch (digestMethod) {
      case "sha256":
        digest = Hash.sha256(data);
        break;
      case "keccak256":
        digest = Hash.keccak256(data);
        break;
      case "hash256":
        digest = Hash.hash256(data);
        break;
      case "noop":
        digest = data.slice();
        break;
      default:
        throw new Error(`Unknown digest method: ${digestMethod}`);
    }

    return privKey.signDigest32(digest);
  }

  signPsbt(
    vault: Vault,
    purpose: number,
    coinType: number,
    psbt: Psbt,
    inputsToSign: {
      index: number;
      address: string;
      path?: string;
    }[]
  ): Promise<Psbt> {
    const bitcoinPubkey = this.getPrivKey(
      vault,
      purpose,
      coinType
    ).getBitcoinPubKey();
    const masterFingerprint = bitcoinPubkey.getMasterFingerprint();

    const isP2TR = (script: NodeBuffer): boolean => {
      try {
        payments.p2tr({ output: script });
        return true;
      } catch (err) {
        return false;
      }
    };

    const isTaprootInput = (input: any) => {
      if (
        !!(
          input.tapInternalKey ||
          input.tapMerkleRoot ||
          (input.tapLeafScript && input.tapLeafScript.length) ||
          (input.tapBip32Derivation && input.tapBip32Derivation.length) ||
          (input.witnessUtxo && isP2TR(input.witnessUtxo.script))
        )
      ) {
        return true;
      }
      return false;
    };

    const masterSeed = this.getMasterSeedFromVault(vault);

    // Must consider partially signed psbt.
    // If the input is already signed, skip signing. (in case input index is not in inputsToSign)
    for (const { index, path } of inputsToSign) {
      const input = psbt.data.inputs[index];

      const signers: PrivKeySecp256k1[] = [];

      if (path) {
        const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
          masterSeed,
          path
        );
        signers.push(new PrivKeySecp256k1(privateKey));
      } else if (input.bip32Derivation) {
        for (const bip32Derivation of input.bip32Derivation) {
          if (
            masterFingerprint &&
            NodeBuffer.from(masterFingerprint, "hex").equals(
              bip32Derivation.masterFingerprint
            )
          ) {
            const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
              masterSeed,
              bip32Derivation.path
            );

            const signer = new PrivKeySecp256k1(privateKey);

            if (
              NodeBuffer.from(signer.getPubKey().toBytes()).equals(
                bip32Derivation.pubkey
              )
            )
              signers.push(signer);
          }
        }
      } else if (input.tapBip32Derivation) {
        for (const tapBip32Derivation of input.tapBip32Derivation) {
          if (
            masterFingerprint &&
            NodeBuffer.from(masterFingerprint, "hex").equals(
              tapBip32Derivation.masterFingerprint
            )
          ) {
            const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
              masterSeed,
              tapBip32Derivation.path
            );

            const signer = new PrivKeySecp256k1(privateKey);

            if (
              toXOnly(NodeBuffer.from(signer.getPubKey().toBytes())).equals(
                tapBip32Derivation.pubkey
              )
            )
              signers.push(signer);
          }
        }
      }

      if (signers.length === 0) {
        throw new Error(`No signer found for input ${index}`);
      }

      // CHECK: signer가 여러 개이면 어떡함? 일단 배제
      const signer = signers[0].toKeyPair();

      if (isTaprootInput(input)) {
        let needTweak = true;

        if (
          input.tapLeafScript &&
          input.tapLeafScript?.length > 0 &&
          !input.tapMerkleRoot
        ) {
          // script path spending: 키 tweak 필요 없음
          input.tapLeafScript.forEach((e) => {
            if (e.controlBlock && e.script) {
              needTweak = false;
            }
          });
        }

        const tapInternalKey = toXOnly(signer.publicKey);
        const taprootSigner = needTweak
          ? signer.tweak(taggedHash("TapTweak", tapInternalKey))
          : signer;

        if (!input.tapInternalKey) {
          input.tapInternalKey = tapInternalKey;
        }

        // sign taproot
        psbt.signTaprootInput(index, taprootSigner);

        // verify taproot
        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => {
            return needTweak
              ? taprootSigner.verifySchnorr(msgHash, signature)
              : signer.verifySchnorr(msgHash, signature);
          }
        );

        if (!isValid) {
          throw new Error("Invalid taproot signature");
        }

        // finalize input signed by this keyring
        psbt.finalizeTaprootInput(index);
      } else {
        // sign ecdsa
        psbt.signInput(index, signer);

        // verify ecdsa
        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => {
            return signer.verify(msgHash, signature);
          }
        );

        if (!isValid) {
          throw new Error("Invalid ecdsa signature");
        }

        // finalize input signed by this keyring
        psbt.finalizeInput(index);
      }
    }

    return Promise.resolve(psbt);
  }

  protected getPrivKey(
    vault: Vault,
    purpose: number,
    coinType: number
  ): PrivKeySecp256k1 {
    const bip44Path = this.getBIP44PathFromVault(vault);
    const masterSeed = this.getMasterSeedFromVault(vault);

    const path = `m/${purpose}'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    const { privateKey, masterFingerprint } =
      Mnemonic.generatePrivateKeyFromMasterSeed(masterSeed, path);

    return new PrivKeySecp256k1(privateKey, masterFingerprint, path);
  }

  protected getBIP44PathFromVault(vault: Vault): {
    account: number;
    change: number;
    addressIndex: number;
  } {
    return vault.insensitive["bip44Path"] as {
      account: number;
      change: number;
      addressIndex: number;
    };
  }

  protected getMasterSeedFromVault(vault: Vault): Buffer {
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const masterSeedText = decrypted["masterSeedText"] as string | undefined;
    if (!masterSeedText) {
      throw new Error("masterSeedText is null");
    }

    return Buffer.from(masterSeedText, "hex");
  }
}
