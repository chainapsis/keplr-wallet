import { Env } from "@keplr-wallet/router";
import { PlainObject, Vault } from "../vault";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";

export type KeyRingStatus = "empty" | "locked" | "unlocked";

export type BIP44HDPath = {
  account: number;
  change: number;
  addressIndex: number;
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
  createKeyRingVault(
    env: Env,
    ...args: any[]
  ): Promise<{
    insensitive: PlainObject;
    sensitive: PlainObject;
  }>;
  getPubKey(
    env: Env,
    vault: Vault,
    coinType: number
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;
  sign(
    env: Env,
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Uint8Array | Promise<Uint8Array>;
}
