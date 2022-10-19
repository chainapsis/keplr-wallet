import { APP_PORT, Env, KeplrError } from "@keplr-wallet/router";
import { BIP44HDPath } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import { Buffer } from "buffer/";
import { EthSignType } from "@keplr-wallet/types";
import { publicKeyConvert } from "secp256k1";

export interface StdPublicKeyDoc {
  publicKey: string;
}

export class KeystoneService {
  protected interactionService!: InteractionService;

  constructor(protected readonly kvStore: KVStore) {}

  init(interactionService: InteractionService) {
    this.interactionService = interactionService;
  }

  async getPublicKey(env: Env, bip44HDPath: BIP44HDPath): Promise<Uint8Array> {
    const res = (await this.interactionService.waitApprove(
      env,
      "/keystone/import-pubkey",
      "import-pubkey",
      {
        bip44HDPath,
      },
      {
        forceOpenWindow: true,
        channel: "keystone",
      }
    )) as StdPublicKeyDoc;
    return publicKeyConvert(Buffer.from(res.publicKey, "hex"), true);
  }

  async sign(
    env: Env,
    bip44HDPath: BIP44HDPath,
    expectedPubKey: Uint8Array,
    message: Uint8Array
  ): Promise<Uint8Array> {}

  async signEthereum(
    env: Env,
    type: EthSignType,
    bip44HDPath: BIP44HDPath,
    expectedPubKey: Uint8Array,
    message: Uint8Array
  ): Promise<Uint8Array> {}

  async useKeystone<T>(env: Env, type: string, data: any): Promise<T> {}
}
