import { VaultService, PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { Buffer as NodeBuffer } from "buffer";
import {
  Hash,
  PrivKeySecp256k1,
  PubKeySecp256k1,
  toXOnly,
} from "@keplr-wallet/crypto";
import { Psbt, payments, Network as BitcoinNetwork } from "bitcoinjs-lib";
import { taggedHash } from "bitcoinjs-lib/src/crypto";

export class KeyRingPrivateKeyService {
  constructor(protected readonly vaultService: VaultService) {}

  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "private-key";
  }

  createKeyRingVault(privateKey: Uint8Array): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    if (!privateKey || privateKey.length === 0) {
      throw new Error("Invalid arguments");
    }

    const publicKey = Buffer.from(
      new PrivKeySecp256k1(privateKey).getPubKey().toBytes()
    ).toString("hex");

    return Promise.resolve({
      insensitive: {
        publicKey,
      },
      sensitive: {
        privateKey: Buffer.from(privateKey).toString("hex"),
      },
    });
  }

  getPubKey(vault: Vault): PubKeySecp256k1 {
    const publicKeyBytes = Buffer.from(
      vault.insensitive["publicKey"] as string,
      "hex"
    );

    return new PubKeySecp256k1(publicKeyBytes);
  }

  sign(
    vault: Vault,
    _purpose: number,
    _coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256" | "hash256" | "noop"
  ): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
      "privateKey"
    ] as string;
    const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));

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

    return privateKey.signDigest32(digest);
  }

  signPsbt(
    vault: Vault,
    _purpose: number,
    _coinType: number,
    psbt: Psbt,
    inputsToSign: {
      index: number;
      address: string;
      hdPath?: string;
      tapLeafHashesToSign?: NodeBuffer[];
    }[],
    network: BitcoinNetwork
  ): Promise<Psbt> {
    const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
      "privateKey"
    ] as string;
    const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));
    const bitcoinPubkey = privateKey.getBitcoinPubKey(network);
    // private key를 사용하는 경우는 HD키 파생이 불가능하므로,
    // derivation path를 별도로 검증하지 않고 주소가 일치하는 경우에만 서명할 수 있도록 한다.
    const signer = privateKey.toKeyPair();

    const tapInternalKey = toXOnly(signer.publicKey);
    const taprootSigner = signer.tweak(taggedHash("TapTweak", tapInternalKey));

    const nativeSegwitAddress =
      bitcoinPubkey.getBitcoinAddress("native-segwit");
    const taprootAddress = bitcoinPubkey.getBitcoinAddress("taproot");

    for (const { index, address, tapLeafHashesToSign } of inputsToSign) {
      // 주소가 일치하지 않은데 스크립트 경로 지출도 아니면 서명이 불가능하다.
      if (
        address !== nativeSegwitAddress &&
        address !== taprootAddress &&
        !tapLeafHashesToSign
      ) {
        throw new Error(`No matching address for input ${index}`);
      }

      const input = psbt.data.inputs[index];
      const isScriptPathSpending =
        tapLeafHashesToSign && tapLeafHashesToSign.length > 0;

      if (this.isTaprootInput(input)) {
        let needTweak = true;

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

        const actualSigner = needTweak ? taprootSigner : signer;

        if (isScriptPathSpending) {
          for (const leafHash of tapLeafHashesToSign) {
            psbt.signTaprootInput(index, actualSigner, leafHash);
          }
        } else {
          psbt.signTaprootInput(index, actualSigner);
        }

        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => {
            return actualSigner.verifySchnorr(msgHash, signature);
          }
        );

        if (!isValid) {
          throw new Error("Invalid taproot signature");
        }

        psbt.finalizeTaprootInput(index);
      } else {
        psbt.signInput(index, signer);

        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => {
            return signer.verify(msgHash, signature);
          }
        );

        if (!isValid) {
          throw new Error("Invalid ecdsa signature");
        }

        psbt.finalizeInput(index);
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
}
