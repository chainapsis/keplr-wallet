import { Env } from "@keplr-wallet/router";
import { PlainObject, Vault } from "../vault";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";

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
    _: Env,
    vault: Vault,
    coinType: number
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;
  sign(
    _: Env,
    vault: Vault,
    coinType: number,
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Uint8Array | Promise<Uint8Array>;
}
