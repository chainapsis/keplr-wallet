import EC from "elliptic";
import keccak from "keccak";
import Web3Utils from "web3-utils";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { Bech32Address } from "@keplr-wallet/cosmos";

const DEFAULT_BECH_PREFIX: string = "fetch";

export interface ParsedEthKey {
  ethAddress: string;
  rawPublicKey: Uint8Array;
  compressedPublicKey: Uint8Array;
}

export function parseEthPrivateKey(
  privateKey: Uint8Array
): ParsedEthKey | undefined {
  if (privateKey.length !== 32) {
    return;
  }

  // parse the private key
  const secp256k1 = new EC.ec("secp256k1");
  const key = secp256k1.keyFromPrivate(privateKey);
  const rawPublicKey = new Uint8Array(
    key.getPublic().encode("array", false).slice(1)
  );
  const compressedPublicKey = new Uint8Array(
    key.getPublic().encodeCompressed("array")
  );

  // generate the raw address
  const rawAddress = `0x${keccak("keccak256")
    .update(Buffer.from(rawPublicKey))
    .digest("hex")
    .slice(24)}`;

  // compute the checksum address
  const ethAddress = Web3Utils.toChecksumAddress(rawAddress);

  // return the parsed output
  return {
    ethAddress,
    rawPublicKey,
    compressedPublicKey,
  };
}

export function addressMatchesPrivateKey(
  address: string,
  privateKey: Uint8Array
): boolean {
  const parsed = parseEthPrivateKey(privateKey);
  if (parsed === undefined) {
    return false;
  }

  return parsed.ethAddress === address;
}

export function ethPublicKeyToAddress(
  compressedPubKey: Uint8Array,
  prefix?: string
): string | undefined {
  if (compressedPubKey.length != 33) {
    return;
  }

  const pubKey = new PubKeySecp256k1(compressedPubKey);
  const address = new Bech32Address(pubKey.getAddress());

  return address.toBech32(prefix ?? DEFAULT_BECH_PREFIX);
}
