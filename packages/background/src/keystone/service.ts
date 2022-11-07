import { Env, KeplrError } from "@keplr-wallet/router";
import { BIP44HDPath } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import {
  KeystoneKeyringData,
  KeystoneUR,
  useKeystoneCosmosKeyring,
} from "./cosmos-keyring";

export const TYPE_KEYSTONE_GET_PUBKEY = "keystone-get-pubkey";

export interface StdPublicKeyDoc {
  publicKey?: KeystoneUR;
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
  ): Promise<KeystoneKeyringData> {
    const keyring = useKeystoneCosmosKeyring({
      readUR: async () => {
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
          throw new KeplrError(
            "keystone",
            301,
            "The process has been canceled."
          );
        }
        if (!res.publicKey || !res.publicKey.cbor || !res.publicKey.type) {
          throw new KeplrError("keystone", 302, "Public key is empty.");
        }
        return res.publicKey;
      },
    });
    await keyring.readKeyring();
    return keyring.getKeyringData();
  }
}
