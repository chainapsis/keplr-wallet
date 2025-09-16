import { PlainObject, Vault } from "../vault";
import { Buffer } from "buffer/";
import { PubKeySecp256k1, PubKeyStarknet } from "@keplr-wallet/crypto";
import { KeplrError } from "@keplr-wallet/router";
import { ModularChainInfo } from "@keplr-wallet/types";
import { Network as BitcoinNetwork } from "bitcoinjs-lib";
import { PubKeyBitcoinCompatible } from "@keplr-wallet/crypto";
import { Descriptor } from "../keyring-bitcoin";
import { App, AppCoinType } from "@keplr-wallet/ledger-cosmos";

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
    _purpose: number,
    coinType: number,
    modularChainInfo: ModularChainInfo
  ): {
    pubKey: PubKeySecp256k1;
    coinType: number;
  } {
    if ("starknet" in modularChainInfo) {
      throw new Error(
        "'getPubKeyStarknet' should be called for Starknet chain"
      );
    }
    if (!("cosmos" in modularChainInfo)) {
      // TODO: 나중에 starknet을 어떻게 지원할지 생각해본다.
      throw new Error("Chain is not a cosmos chain");
    }

    let app = "Cosmos";

    if (coinType === 60) {
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
      if (vault.insensitive["THORChain"]) {
        app = "THORChain";
      }

      const appCoinType = AppCoinType[app as App];
      if (appCoinType == null) {
        throw new Error(`CoinType is null: ${app}`);
      }
      coinType = appCoinType;
    }

    if (!vault.insensitive[app]) {
      throw new Error(`Ledger is not initialized for ${app}`);
    }

    const bytes = Buffer.from(
      (vault.insensitive[app] as any)["pubKey"] as string,
      "hex"
    );
    return {
      pubKey: new PubKeySecp256k1(bytes),
      coinType,
    };
  }

  getPubKeyStarknet(
    vault: Vault,
    modularChainInfo: ModularChainInfo
  ): PubKeyStarknet {
    if (!("starknet" in modularChainInfo)) {
      throw new Error("'modularChainInfo' should have Starknet chain info");
    }

    if (!vault.insensitive["Starknet"]) {
      throw new KeplrError(
        "keyring",
        901,
        "No Starknet public key. Initialize Starknet app on Ledger by selecting the chain in the extension"
      );
    }

    const bytes = Buffer.from(
      (vault.insensitive["Starknet"] as any)["pubKey"] as string,
      "hex"
    );

    return new PubKeyStarknet(bytes);
  }

  getPubKeyBitcoin(
    vault: Vault,
    purpose: number,
    coinType: number,
    network: BitcoinNetwork,
    modularChainInfo: ModularChainInfo
  ): PubKeyBitcoinCompatible {
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error("'modularChainInfo' should have Bitcoin chain info");
    }

    const { account, change, addressIndex } = this.getBIP44PathFromVault(vault);

    const accountPath = `${purpose}'/${coinType}'/${account}'`;
    const additionalPath = `${change}/${addressIndex}`;

    const descriptor =
      (vault.insensitive[coinType === 0 ? "Bitcoin" : "Bitcoin Test"] as any)[
        accountPath
      ] ||
      (vault.insensitive[coinType === 0 ? "Bitcoin" : "Bitcoin Test"] as any)[
        `m/${accountPath}`
      ];

    if (!descriptor) {
      throw new KeplrError(
        "keyring",
        901,
        "No Bitcoin extended public key. Initialize Bitcoin app on Ledger by selecting the chain in the extension"
      );
    }

    const { masterFingerprint, xpub } = Descriptor.parse(descriptor);

    return PubKeyBitcoinCompatible.fromExtendedKey(
      xpub,
      accountPath,
      masterFingerprint,
      additionalPath,
      network
    );
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
}
