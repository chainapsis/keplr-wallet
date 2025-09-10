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
import { Psbt, payments, Network as BitcoinNetwork } from "bitcoinjs-lib";
import { taggedHash } from "bitcoinjs-lib/src/crypto";
import { SignPsbtOptions, ModularChainInfo } from "@keplr-wallet/types";
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

  getPubKey(
    vault: Vault,
    purpose: number,
    coinType: number
  ): { pubKey: PubKeySecp256k1; coinType: number } {
    const bip44Path = this.getBIP44PathFromVault(vault);

    const tag = `pubKey-m/${purpose}'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    if (vault.insensitive[tag]) {
      const pubKey = Buffer.from(vault.insensitive[tag] as string, "hex");
      return {
        coinType,
        pubKey: new PubKeySecp256k1(pubKey),
      };
    }

    const privKey = this.getPrivKey(vault, purpose, coinType);

    const pubKey = privKey.getPubKey();

    const pubKeyText = Buffer.from(pubKey.toBytes()).toString("hex");
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });

    return {
      coinType,
      pubKey,
    };
  }

  getPubKeyBitcoin(
    vault: Vault,
    purpose: number,
    coinType: number,
    network: BitcoinNetwork
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

      return new PubKeyBitcoinCompatible(
        pubKey,
        network,
        masterFingerprint,
        path
      );
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
      sighashTypes?: number[];
      disableTweakSigner?: boolean;
      useTweakedSigner?: boolean;
    }[],
    network: BitcoinNetwork,
    _modularChainInfo: ModularChainInfo,
    options?: SignPsbtOptions
  ): Promise<Psbt> {
    const bitcoinPubkey = this.getPrivKey(
      vault,
      purpose,
      coinType
    ).getBitcoinPubKey(network);
    const userAddress = bitcoinPubkey.getBitcoinAddress();
    const masterSeed = this.getMasterSeedFromVault(vault);
    const autoFinalized = options?.autoFinalized ?? true;

    for (const {
      index,
      address,
      hdPath,
      tapLeafHashesToSign,
      sighashTypes,
      disableTweakSigner,
      useTweakedSigner,
    } of inputsToSign) {
      // default address와 일치하거나, hdPath를 통해 파생 키를 생성할 수 있는 경우에만 서명한다.
      if (
        (address !== userAddress && !hdPath) ||
        (hdPath && !this.validateHdPath(hdPath, coinType))
      ) {
        throw new Error("Unable to sign psbt");
      }

      const { privateKey } = Mnemonic.generatePrivateKeyFromMasterSeed(
        masterSeed,
        hdPath
      );
      const privKey = new PrivKeySecp256k1(privateKey);
      const signer = privKey.toKeyPair();

      const input = psbt.data.inputs[index];
      const isScriptPathSpending =
        tapLeafHashesToSign && tapLeafHashesToSign.length > 0;

      if (this.isTaprootInput(input)) {
        // useTweakedSigner가 disableTweakSigner 보다 우세
        let needTweak = useTweakedSigner ?? disableTweakSigner ?? true;

        // script path spending인 경우 키 트윅이 필요 없음
        if (isScriptPathSpending) {
          needTweak = false;
        } else if (
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

        if (isScriptPathSpending) {
          for (const leafHash of tapLeafHashesToSign) {
            // 트리의 특정 리프에 대해서만 서명
            // 스크립트 서명은 tapScriptSig에 순서대로 추가된다.
            psbt.signTaprootInput(
              index,
              taprootSigner,
              NodeBuffer.from(leafHash), // error: tapleafhashtosign.equals is not a function -> wrap with NodeBuffer
              sighashTypes
            );
          }
        } else {
          psbt.signTaprootInput(index, taprootSigner, undefined, sighashTypes);
        }

        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) =>
            taprootSigner.verifySchnorr(msgHash, signature)
        );

        if (!isValid) {
          throw new Error("Invalid taproot signature");
        }

        if (autoFinalized) {
          psbt.finalizeTaprootInput(index);
        }
      } else {
        psbt.signInput(index, signer, sighashTypes);

        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => signer.verify(msgHash, signature)
        );

        if (!isValid) {
          throw new Error("Invalid ecdsa signature");
        }

        if (autoFinalized) {
          psbt.finalizeInput(index);
        }
      }
    }

    return Promise.resolve(psbt);
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

  private validateHdPath(hdPath: string, coinType: number): boolean {
    const segments = hdPath.split("/");

    // 기본 형식 검증 (m/purpose'/coinType'/account'/change/index)
    if (segments.length !== 6 || segments[0] !== "m") {
      return false;
    }

    // purpose는 84' 또는 86'만 허용 (native segwit 또는 taproot)
    if (segments[1] !== "84'" && segments[1] !== "86'") {
      return false;
    }

    // coinType이 일치해야 한다.
    if (segments[2] !== `${coinType}'`) {
      return false;
    }

    // account, change, addressIndex는 일단 생략
    return true;
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
