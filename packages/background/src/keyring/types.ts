import { PlainObject, Vault } from "../vault";
import {
  PubKeyBitcoinCompatible,
  PubKeySecp256k1,
  PubKeyStarknet,
} from "@keplr-wallet/crypto";
import { ModularChainInfo, SignPsbtOptions } from "@keplr-wallet/types";
import { Psbt, Network as BitcoinNetwork } from "bitcoinjs-lib";

export type KeyRingStatus = "empty" | "locked" | "unlocked";

export type BIP44HDPath = {
  account: number;
  change: number;
  addressIndex: number;
};

export type ExtendedKey = {
  type: "pkh" | "wpkh" | "tr";
  masterFingerprint: string;
  xpub: string;
  derivationPath: string; // `m/purpose'/coinType'/account'` or `purpose'/coinType'/account'`
};

export interface KeyInfo {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly isSelected: boolean;
  readonly insensitive: PlainObject;
}

export interface KeyRing {
  supportedKeyRingType(): string;
  createKeyRingVault(...args: any[]): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;
  getPubKey(
    vault: Vault,
    purpose: number,
    coinType: number,
    modularChainInfo: ModularChainInfo
  ):
    | { pubKey: PubKeySecp256k1; coinType: number | undefined }
    | Promise<{ pubKey: PubKeySecp256k1; coinType: number | undefined }>;
  // This method should only be implemented for Ledger keyring.
  getPubKeyStarknet?(
    vault: Vault,
    modularChainInfo: ModularChainInfo
  ): PubKeyStarknet | Promise<PubKeyStarknet>;
  getPubKeyBitcoin?(
    vault: Vault,
    purpose: number,
    coinType: number,
    network: BitcoinNetwork,
    modularChainInfo: ModularChainInfo
  ): PubKeyBitcoinCompatible | Promise<PubKeyBitcoinCompatible>;
  sign(
    vault: Vault,
    purpose: number,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256" | "hash256" | "noop",
    modularChainInfo: ModularChainInfo
  ):
    | {
        readonly r: Uint8Array;
        readonly s: Uint8Array;
        readonly v: number | null;
      }
    | Promise<{
        readonly r: Uint8Array;
        readonly s: Uint8Array;
        readonly v: number | null;
      }>;
  signPsbt?(
    vault: Vault,
    purpose: number,
    coinType: number,
    psbt: Psbt,
    inputsToSign: {
      index: number;
      address: string;
      hdPath?: string;
      tapLeafHashesToSign?: Buffer[];
    }[],
    network: BitcoinNetwork,
    modularChainInfo: ModularChainInfo,
    options?: SignPsbtOptions
  ): Promise<Psbt>;
}

export interface ExportedKeyRingVault {
  type: "mnemonic" | "private-key";
  id: string;
  insensitive: PlainObject;
  sensitive: string;
}
