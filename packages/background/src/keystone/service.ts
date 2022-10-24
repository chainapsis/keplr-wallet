import {
  // APP_PORT,
  Env,
  KeplrError,
} from "@keplr-wallet/router";
import { BIP44HDPath } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import { Buffer } from "buffer/";
// import { EthSignType } from "@keplr-wallet/types";
import { publicKeyConvert } from "secp256k1";

export const TYPE_KEYSTONE_GET_PUBKEY = "keystone-get-pubkey";

export interface KeystonePublicKey {
  coinType: number;
  bip44HDPath: BIP44HDPath;
  pubKey: string;
}

export interface StdPublicKeyDoc {
  publicKey?: KeystonePublicKey[];
  abort?: boolean;
}

export class KeystoneService {
  protected interactionService!: InteractionService;

  constructor(protected readonly kvStore: KVStore) {}

  init(interactionService: InteractionService) {
    this.interactionService = interactionService;
  }

  async getPubkey(
    env: Env,
    bip44HDPath: BIP44HDPath
  ): Promise<KeystonePublicKey[]> {
    const res = (await this.interactionService.waitApprove(
      env,
      "/keystone/import-pubkey",
      TYPE_KEYSTONE_GET_PUBKEY,
      {
        bip44HDPath,
      },
      {
        forceOpenWindow: true,
        channel: "keystone",
      }
    )) as StdPublicKeyDoc;
    if (res.abort) {
      throw new KeplrError("keystone", 301, "The process has been canceled.");
    }
    if (!(res.publicKey instanceof Array) || res.publicKey.length === 0) {
      throw new KeplrError("keystone", 302, "Public key is empty.");
    }
    return res.publicKey.map((k) => {
      return {
        ...k,
        pubKey: Buffer.from(
          publicKeyConvert(Buffer.from(k.pubKey, "hex"), true)
        ).toString("hex"),
      };
    });
  }

  // async sign(
  //   env: Env,
  //   bip44HDPath: BIP44HDPath,
  //   expectedPubKey: Uint8Array,
  //   message: Uint8Array
  // ): Promise<Uint8Array> {}

  // async signEthereum(
  //   env: Env,
  //   type: EthSignType,
  //   bip44HDPath: BIP44HDPath,
  //   expectedPubKey: Uint8Array,
  //   message: Uint8Array
  // ): Promise<Uint8Array> {}

  // async useKeystone<T>(env: Env, type: string, data: any): Promise<T> {}
}
