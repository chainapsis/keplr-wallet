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
import {
  AccessListEIP2930Transaction,
  FeeMarketEIP1559Transaction,
  Transaction,
  TypedTransaction,
} from "@ethereumjs/tx";
import { computeAddress } from "@ethersproject/transactions";
import { publicKeyConvert } from "secp256k1";
import Common from "@ethereumjs/common";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { Keyring as EvmKeyring } from "@keystonehq/evm-keyring";

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
  Message = "signMessage",
}

enum EthSignFunction {
  Transaction = "signTransaction",
  Message = "signMessage",
  Data = "signTypedData",
}

enum EvmSignFunction {
  Amino = "signCosmosAmino",
  Direct = "signCosmosDirect",
  Message = "signArbitrary",
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
    let signReject: { (arg0: unknown): void };
    const keyring = useKeystoneCosmosKeyring({
      keyringData,
      playUR: async (ur) => {
        (async () => {
          try {
            const res = (await this.interactionService.waitApprove(
              env,
              "/keystone/sign",
              TYPE_KEYSTONE_SIGN,
              {
                coinType,
                bip44HDPath,
                ur,
                message,
              }
            )) as StdSignDoc;
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
          } catch (err) {
            signReject(err);
          }
        })();
      },
      readUR: () =>
        new Promise<KeystoneUR>((resolve, reject) => {
          signResolve = resolve;
          signReject = reject;
        }),
    });
    const signFn: SignFunction = {
      [SignMode.Amino]: SignFunction.Amino,
      [SignMode.Direct]: SignFunction.Direct,
      [SignMode.Message]: SignFunction.Message,
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
    chainId: string,
    bip44HDPath: BIP44HDPath,
    key: Key,
    keyringData: KeystoneKeyringData,
    message: Uint8Array,
    mode: EthSignType
  ): Promise<Uint8Array> {
    let signResolve: { (arg0: KeystoneUR): void };
    let signReject: { (arg0: unknown): void };
    const keyring = useKeystoneEthereumKeyring({
      keyringData,
      playUR: async (ur) => {
        (async () => {
          try {
            const res = (await this.interactionService.waitApprove(
              env,
              "/keystone/sign",
              TYPE_KEYSTONE_SIGN,
              {
                coinType,
                bip44HDPath,
                ur,
                message,
              }
            )) as StdSignDoc;
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
          } catch (err) {
            signReject(err);
          }
        })();
      },
      readUR: () =>
        new Promise<KeystoneUR>((resolve, reject) => {
          signResolve = resolve;
          signReject = reject;
        }),
    });
    const signFn: EthSignFunction = {
      [EthSignType.TRANSACTION]: EthSignFunction.Transaction,
      [EthSignType.MESSAGE]: EthSignFunction.Message,
      [EthSignType.EIP712]: EthSignFunction.Data,
    }[mode];
    let data: TypedTransaction | string = "";
    if (mode === EthSignType.TRANSACTION) {
      const msg = JSON.parse(Buffer.from(message).toString());
      const transactionType = +msg.type;
      if (transactionType === 2) {
        // [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)
        data = new FeeMarketEIP1559Transaction(msg);
      } else if (transactionType === 1) {
        // [EIP-2930](https://eips.ethereum.org/EIPS/eip-2930)
        data = new AccessListEIP2930Transaction(msg);
      } else {
        const ethChainId = EthermintChainIdHelper.parse(chainId);
        data = new Transaction(msg, {
          // TODO: Other properties is need or not, such as "hardfork".
          common: Common.custom({ chainId: ethChainId.ethChainId }),
        });
      }
    } else if (mode === EthSignType.MESSAGE) {
      data = Buffer.from(message).toString("hex");
    } else if (mode === EthSignType.EIP712) {
      data = JSON.parse(Buffer.from(message).toString());
    }
    const signRes = await keyring[signFn](
      computeAddress(publicKeyConvert(key.pubKey, false)),
      data
    );
    if (mode === EthSignType.TRANSACTION) {
      const rlpData = ((signRes as any) as TypedTransaction).serialize();
      return rlpData;
    }
    return Buffer.from((signRes as string).replace(/^0x/, ""), "hex");
  }

  async signEvm(
    env: Env,
    coinType: number,
    bip44HDPath: BIP44HDPath,
    key: Key,
    keyringData: KeystoneKeyringData,
    message: Uint8Array,
    mode: SignMode,
    chainId?: number
  ): Promise<Uint8Array> {
    let signResolve: { (arg0: KeystoneUR): void };
    let signReject: { (arg0: unknown): void };
    const keyring = new EvmKeyring({
      ...keyringData,
      keys: keyringData.keys.map((e, index) => ({
        hdPath: `44'/${e.coinType}'/${e.bip44HDPath.account}'/${e.bip44HDPath.change}/${e.bip44HDPath.addressIndex}`,
        index,
        pubKey: e.pubKey,
      })),
    });
    keyring.onPlayQR(async (ur) => {
      (async () => {
        try {
          const res = (await this.interactionService.waitApprove(
            env,
            "/keystone/sign",
            TYPE_KEYSTONE_SIGN,
            {
              coinType,
              bip44HDPath,
              ur,
              message,
            }
          )) as StdSignDoc;
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
        } catch (err) {
          signReject(err);
        }
      })();
    });
    keyring.onReadQR(
      () =>
        new Promise<KeystoneUR>((resolve, reject) => {
          signResolve = resolve;
          signReject = reject;
        })
    );
    const signFn = {
      [SignMode.Amino]: EvmSignFunction.Amino,
      [SignMode.Direct]: EvmSignFunction.Direct,
      [SignMode.Message]: EvmSignFunction.Message,
    }[mode];
    const res = await keyring[signFn](
      Buffer.from(key.pubKey).toString("hex"),
      message,
      chainId,
      Buffer.from(key.address).toString("hex"),
      "Keplr"
    );
    return res.signature;
  }
}
