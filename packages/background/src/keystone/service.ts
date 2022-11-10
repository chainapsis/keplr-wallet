import { Env, KeplrError } from "@keplr-wallet/router";
import { BIP44HDPath, Key } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import {
  KeystoneKeyringData,
  KeystoneUR,
  useKeystoneCosmosKeyring,
} from "./cosmos-keyring";

export const TYPE_KEYSTONE_GET_PUBKEY = "keystone-get-pubkey";
export const TYPE_KEYSTONE_SIGN = "keystone-sign";

export interface StdDoc {
  abort?: boolean;
}

export interface StdPublicKeyDoc extends StdDoc {
  publicKey?: KeystoneUR;
}

export interface StdSignDoc extends StdDoc {
  signature?: KeystoneUR;
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

  async sign(
    env: Env,
    coinType: number,
    bip44HDPath: BIP44HDPath,
    key: Key,
    keyringData: KeystoneKeyringData,
    message: Uint8Array
  ): Promise<Uint8Array> {
    let signResolve: { (arg0: KeystoneUR): void };
    console.log("keyringData", keyringData);
    const keyring = useKeystoneCosmosKeyring({
      keyringData,
      playUR: async (ur) => {
        (this.interactionService.waitApprove(
          env,
          "/keystone/sign",
          TYPE_KEYSTONE_SIGN,
          {
            coinType,
            bip44HDPath,
            ur,
            message,
          }
        ) as Promise<StdSignDoc>).then((res) => {
          if (res.abort) {
            throw new KeplrError(
              "keystone",
              301,
              "The process has been canceled."
            );
          }
          if (!res.signature) {
            throw new KeplrError("keystone", 303, "Signature is empty.");
          }
          signResolve(res.signature);
        });
      },
      readUR: () =>
        new Promise<KeystoneUR>((resolve) => {
          signResolve = resolve;
        }),
    });
    console.log(
      "keyring.signAminoTransaction",
      Buffer.from(key.pubKey).toString("hex"),
      Buffer.from(key.address).toString("hex"),
      Buffer.from(message).toString("hex")
    );
    console.log(Buffer.from(message).toString());
    const res = await keyring.signAminoTransaction(
      Buffer.from(key.pubKey).toString("hex"),
      message,
      [Buffer.from(key.address).toString("hex")],
      "Keplr"
    );
    console.log(
      "keyring.signAminoTransaction signature",
      res.signature.toString("hex")
    );
    return res.signature;
  }
}
