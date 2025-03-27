import { PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { KeyRingService } from "../keyring";
import { MultiAccounts } from "./types";

export class KeyRingKeystoneService {
  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "keystone";
  }

  createKeyRingVault(multiAccounts: MultiAccounts): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    const keys: PlainObject = {};
    multiAccounts.keys.forEach((k) => {
      keys[k.path] = {
        pubKey: k.publicKey,
        chain: k.chain,
        name: k.name,
      };
    });
    return Promise.resolve({
      insensitive: {
        xfp: multiAccounts.masterFingerprint,
        device: multiAccounts.device,
        deviceId: multiAccounts.deviceId,
        keys,
        bip44Path: multiAccounts.bip44Path,
        connectionType: multiAccounts.connectionType,
      },
      sensitive: {},
    });
  }

  getPubKey(vault: Vault, purpose: number, coinType: number): PubKeySecp256k1 {
    let bytes;
    if (vault.insensitive["keys"]) {
      const path = Object.keys(vault.insensitive["keys"]).find((path) => {
        const result = KeyRingService.parseBIP44Path(path);
        return result.purpose === purpose && result.coinType === coinType;
      });
      if (!path) {
        throw new Error(
          `Purpose ${purpose} and CoinType ${coinType} is not supported.`
        );
      }
      bytes = Buffer.from(
        ((vault.insensitive["keys"] as PlainObject)[path] as PlainObject)[
          "pubKey"
        ] as string,
        "hex"
      );
    } else {
      throw new Error(`Keystone is not initialized.`);
    }
    return new PubKeySecp256k1(bytes);
  }

  sign(): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    throw new Error(
      "Keystone can't sign message in background. You should provide the signature from frontend."
    );
  }
}
