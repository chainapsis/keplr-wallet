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
      hdPath?: string;
      tapLeafHashesToSign?: NodeBuffer[];
    }[]
  ): Promise<Psbt> {
    const bitcoinPubkey = this.getPrivKey(
      vault,
      purpose,
      coinType
    ).getBitcoinPubKey();
    const masterFingerprint = bitcoinPubkey.getMasterFingerprint();
    const masterSeed = this.getMasterSeedFromVault(vault);

    // Must consider partially signed psbt.
    for (const { index, hdPath } of inputsToSign) {
      const input = psbt.data.inputs[index];

      const privKey = this.findSignerForInput(
        psbt,
        index,
        masterSeed,
        masterFingerprint,
        hdPath
      );
      if (!privKey) {
        throw new Error(`No signer found for input ${index}`);
      }

      const signer = privKey.toKeyPair();

      if (this.isTaprootInput(input)) {
        let needTweak = true;

        // script path spending인 경우 키 트윅이 필요 없음
        if (
          input.tapLeafScript &&
          input.tapLeafScript.length > 0 &&
          !input.tapMerkleRoot
        ) {
          for (const leaf of input.tapLeafScript) {
            if (leaf.controlBlock && leaf.script) {
              needTweak = false;
              break;
            }
          }
        }

        const tapInternalKey = toXOnly(signer.publicKey);
        if (!input.tapInternalKey) {
          input.tapInternalKey = tapInternalKey;
        }

        const taprootSigner = needTweak
          ? signer.tweak(taggedHash("TapTweak", tapInternalKey))
          : signer;

        psbt.signTaprootInput(index, taprootSigner);

        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) =>
            taprootSigner.verifySchnorr(msgHash, signature)
        );

        if (!isValid) {
          throw new Error("Invalid taproot signature");
        }

        psbt.finalizeTaprootInput(index);
      } else {
        psbt.signInput(index, signer);

        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => signer.verify(msgHash, signature)
        );

        if (!isValid) {
          throw new Error("Invalid ecdsa signature");
        }

        psbt.finalizeInput(index);
      }
    }

    return Promise.resolve(psbt);
  }

  private findSignerForInput(
    psbt: Psbt,
    index: number,
    masterSeed: Buffer,
    masterFingerprint: string | undefined,
    explicitPath?: string
  ): PrivKeySecp256k1 | null {
    // 1. 명시적 경로가 있는 경우
    if (explicitPath) {
      const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
        masterSeed,
        explicitPath
      );
      return new PrivKeySecp256k1(privateKey);
    }

    const input = psbt.data.inputs[index];

    // 2. BIP32 파생 정보가 있는 경우
    if (input.bip32Derivation && masterFingerprint) {
      for (const derivation of input.bip32Derivation) {
        if (
          !NodeBuffer.from(masterFingerprint, "hex").equals(
            derivation.masterFingerprint
          )
        ) {
          continue;
        }

        const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
          masterSeed,
          derivation.path
        );
        const signer = new PrivKeySecp256k1(privateKey);

        if (
          NodeBuffer.from(signer.getPubKey().toBytes()).equals(
            derivation.pubkey
          )
        ) {
          return signer;
        }
      }
    }

    // 3. Taproot BIP32 파생 정보가 있는 경우
    if (input.tapBip32Derivation && masterFingerprint) {
      for (const derivation of input.tapBip32Derivation) {
        if (
          !NodeBuffer.from(masterFingerprint, "hex").equals(
            derivation.masterFingerprint
          )
        ) {
          continue;
        }

        const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
          masterSeed,
          derivation.path
        );
        const signer = new PrivKeySecp256k1(privateKey);

        if (
          toXOnly(NodeBuffer.from(signer.getPubKey().toBytes())).equals(
            derivation.pubkey
          )
        ) {
          return signer;
        }
      }
    }

    return null;
  }

  private isTaprootInput(input: any): boolean {
    const isP2TR = (script: NodeBuffer): boolean => {
      try {
        payments.p2tr({ output: script });
        return true;
      } catch (err) {
        return false;
      }
    };

    return !!(
      input.tapInternalKey ||
      input.tapMerkleRoot ||
      (input.tapLeafScript && input.tapLeafScript.length) ||
      (input.tapBip32Derivation && input.tapBip32Derivation.length) ||
      (input.witnessUtxo && isP2TR(input.witnessUtxo.script))
    );
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
