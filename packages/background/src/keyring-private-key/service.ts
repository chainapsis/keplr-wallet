import { VaultService, PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { Buffer as NodeBuffer } from "buffer";
import {
  Hash,
  PrivKeySecp256k1,
  PubKeySecp256k1,
  toXOnly,
} from "@keplr-wallet/crypto";
import { Psbt, payments, Network as BitcoinJSNetwork } from "bitcoinjs-lib";
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
      path?: string;
    }[],
    network: BitcoinJSNetwork
  ): Promise<Psbt> {
    const privateKeyText = this.vaultService.decrypt(vault.sensitive)[
      "privateKey"
    ] as string;
    const privateKey = new PrivKeySecp256k1(Buffer.from(privateKeyText, "hex"));
    const bitcoinPubkey = privateKey.getBitcoinPubKey();
    // private key를 사용하는 경우는 HD키 파생이 불가능하므로,
    // derivation path를 별도로 검증하지 않고 주소가 일치하는 경우에만 서명할 수 있도록 한다.
    const signer = privateKey.toKeyPair();

    const tapInternalKey = toXOnly(signer.publicKey);
    const taprootSigner = signer.tweak(taggedHash("TapTweak", tapInternalKey));

    const nativeSegwitAddress = bitcoinPubkey.getBitcoinAddress(
      "native-segwit",
      network
    );
    const taprootAddress = bitcoinPubkey.getBitcoinAddress("taproot", network);

    // Must consider partially signed psbt.
    // If the input is already signed, skip signing. (in case input index is not in inputsToSign)
    for (const { index, address } of inputsToSign) {
      if (address !== nativeSegwitAddress && address !== taprootAddress) {
        throw new Error(`No matching address for input ${index}`);
      }

      const input = psbt.data.inputs[index];

      if (this.isTaprootInput(input)) {
        let needTweak = true;

        if (
          input.tapLeafScript &&
          input.tapLeafScript.length > 0 &&
          !input.tapMerkleRoot
        ) {
          // script path spending: 키 tweak 필요 없음
          for (const leaf of input.tapLeafScript) {
            if (leaf.controlBlock && leaf.script) {
              needTweak = false;
              break;
            }
          }
        }

        if (!input.tapInternalKey) {
          input.tapInternalKey = tapInternalKey;
        }

        const actualSigner = needTweak ? taprootSigner : signer;

        // sign taproot
        psbt.signTaprootInput(index, actualSigner);

        // verify taproot
        const isValid = psbt.validateSignaturesOfInput(
          index,
          (_, msgHash, signature) => {
            return actualSigner.verifySchnorr(msgHash, signature);
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
