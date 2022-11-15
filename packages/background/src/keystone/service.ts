import { Env, KeplrError } from "@keplr-wallet/router";
import { BIP44HDPath, Key, SignMode } from "../keyring";
import { KVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import {
  KeystoneKeyringData,
  KeystoneUR,
  useKeystoneCosmosKeyring,
} from "./cosmos-keyring";
import { EthSignType } from "@keplr-wallet/types";
import { useKeystoneEthereumKeyring } from "./ethereum-keyring";
import { Transaction } from "@ethereumjs/tx";
import { computeAddress } from "@ethersproject/transactions";
import { publicKeyConvert } from "secp256k1";

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

enum SignFunction {
  Amino = "signAminoTransaction",
  Direct = "signDirectTransaction",
}

enum EthSignFunction {
  Transaction = "signTransaction",
  Message = "signMessage",
  Data = "signTypedData",
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
    message: Uint8Array,
    mode: SignMode
  ): Promise<Uint8Array> {
    let signResolve: { (arg0: KeystoneUR): void };
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
    const signFn: SignFunction = {
      [SignMode.Amino]: SignFunction.Amino,
      [SignMode.Direct]: SignFunction.Direct,
    }[mode];
    const res = await keyring[signFn](
      Buffer.from(key.pubKey).toString("hex"),
      message,
      [Buffer.from(key.address).toString("hex")],
      "Keplr"
    );
    return res.signature;
  }

  async signEthereum(
    env: Env,
    coinType: number,
    bip44HDPath: BIP44HDPath,
    key: Key,
    keyringData: KeystoneKeyringData,
    message: Uint8Array,
    mode: EthSignType
  ): Promise<Uint8Array> {
    let signResolve: { (arg0: KeystoneUR): void };
    const keyring = useKeystoneEthereumKeyring({
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
    const signFn: EthSignFunction = {
      [EthSignType.TRANSACTION]: EthSignFunction.Transaction,
      [EthSignType.MESSAGE]: EthSignFunction.Message,
      [EthSignType.EIP712]: EthSignFunction.Data,
    }[mode];
    const msg = JSON.parse(Buffer.from(message).toString());
    console.log("message", msg);
    const tx = new Transaction(msg);
    console.log("tx", Buffer.from(key.address).toString("hex"), tx);
    const signRes = await keyring[signFn](
      computeAddress(publicKeyConvert(key.pubKey, false)),
      tx
    );
    console.log("signRes", signRes);
    return Buffer.from(signRes as string, "utf-8");
  }
}
