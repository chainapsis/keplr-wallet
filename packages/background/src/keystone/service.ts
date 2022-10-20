import {
  // APP_PORT,
  Env,
  KeplrError,
  // KeplrError
} from "@keplr-wallet/router";
import { BIP44HDPath } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import { Buffer } from "buffer/";
// import { EthSignType } from "@keplr-wallet/types";
import { publicKeyConvert } from "secp256k1";

export const TYPE_KEYSTONE_GET_PUBKEY = "keystone-get-pubkey";

export interface StdPublicKeyDoc {
  publicKey?: string;
  abort?: boolean;
}

export class KeystoneService {
  protected interactionService!: InteractionService;

  constructor(protected readonly kvStore: KVStore) {}

  init(interactionService: InteractionService) {
    this.interactionService = interactionService;
  }

  async getPubkey(env: Env, bip44HDPath: BIP44HDPath): Promise<Uint8Array> {
    const res = (await this.interactionService
      .waitApprove(
        env,
        "/keystone/import-pubkey",
        TYPE_KEYSTONE_GET_PUBKEY,
        {
          bip44HDPath,
          a: 123,
        },
        {
          forceOpenWindow: true,
          channel: "keystone",
        }
      )
      .catch(() => {
        throw new KeplrError("keystone", 301, "get pubkey error");
      })) as StdPublicKeyDoc;
    if (res.abort) {
      throw new KeplrError("keystone", 302, "get pubkey canceled");
    }
    if (!res.publicKey) {
      throw new KeplrError("keystone", 303, "public key error");
    }
    return publicKeyConvert(Buffer.from(res.publicKey, "hex"), true);
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
