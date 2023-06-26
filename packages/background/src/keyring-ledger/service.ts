import { PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { KeplrError } from "@keplr-wallet/router";
import { ChainInfo } from "@keplr-wallet/types";
import { KeyRingService } from "../keyring";

export class KeyRingLedgerService {
  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "ledger";
  }

  createKeyRingVault(
    pubKey: Uint8Array,
    app: string,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }> {
    return Promise.resolve({
      insensitive: {
        [app]: {
          pubKey: Buffer.from(pubKey).toString("hex"),
        },
        bip44Path,
      },
      sensitive: {},
    });
  }

  getPubKey(
    vault: Vault,
    _coinType: number,
    chainInfo: ChainInfo
  ): PubKeySecp256k1 {
    let app = "Cosmos";

    const isEthermintLike = KeyRingService.isEthermintLike(chainInfo);
    if (isEthermintLike) {
      app = "Ethereum";
      if (!vault.insensitive[app]) {
        throw new KeplrError(
          "keyring",
          901,
          "No Ethereum public key. Initialize Ethereum app on Ledger by selecting the chain in the extension"
        );
      }
    }

    if (app === "Cosmos") {
      if (vault.insensitive["Terra"]) {
        // Use terra alternatively.
        app = "Terra";
      }
      if (vault.insensitive["Secret"]) {
        app = "Secret";
      }
    }

    if (!vault.insensitive[app]) {
      throw new Error(`Ledger is not initialized for ${app}`);
    }

    const bytes = Buffer.from(
      (vault.insensitive[app] as any)["pubKey"] as string,
      "hex"
    );
    return new PubKeySecp256k1(bytes);
  }

  sign(): {
    readonly r: Uint8Array;
    readonly s: Uint8Array;
    readonly v: number | null;
  } {
    throw new Error(
      "Ledger can't sign message in background. You should provide the signature from frontend."
    );
  }
}
