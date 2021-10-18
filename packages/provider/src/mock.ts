import {
  Keplr,
  KeplrIntereactionOptions,
  KeplrSignOptions,
  Key,
} from "@keplr-wallet/types";
import {
  AminoSignResponse,
  BroadcastMode,
  makeCosmoshubPath,
  OfflineSigner,
  Secp256k1HdWallet,
  StdSignDoc,
  StdTx,
} from "@cosmjs/launchpad";
import { SecretUtils } from "secretjs/types/enigmautils";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
import { CosmJSOfflineSigner } from "./cosmjs";
import { DirectSignResponse } from "@cosmjs/proto-signing/build/signer";

export class MockKeplr implements Keplr {
  readonly version: string = "0.0.1";

  public defaultOptions: KeplrIntereactionOptions = {};

  public readonly walletMap: {
    [chainId: string]: Secp256k1HdWallet | undefined;
  } = {};

  async getHdWallet(chainId: string): Promise<Secp256k1HdWallet> {
    if (!this.walletMap[chainId]) {
      const chainInfo = this.chainInfos.find(
        (info) => info.chainId === chainId
      );

      if (!chainInfo) {
        throw new Error("Unknown chain");
      }

      this.walletMap[chainId] = await Secp256k1HdWallet.fromMnemonic(
        this.mnemonic,
        makeCosmoshubPath(0),
        chainInfo.bech32Config.bech32PrefixAccAddr
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.walletMap[chainId]!;
  }

  constructor(
    public readonly sendTxFn: (
      chainId: string,
      stdTx: StdTx,
      mode: BroadcastMode
    ) => Promise<Uint8Array>,
    public readonly chainInfos: {
      readonly chainId: string;
      readonly bech32Config: {
        readonly bech32PrefixAccAddr: string;
      };
    }[],
    public readonly mnemonic: string
  ) {}

  enable(): Promise<void> {
    // noop.
    return Promise.resolve(undefined);
  }

  enigmaDecrypt(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  enigmaEncrypt(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  experimentalSuggestChain(): Promise<void> {
    throw new Error("Not implemented");
  }

  getEnigmaPubKey(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  getEnigmaUtils(): SecretUtils {
    throw new Error("Not implemented");
  }

  async getKey(chainId: string): Promise<Key> {
    const cosmJsKeys = await (await this.getHdWallet(chainId)).getAccounts();

    return {
      name: "",
      algo: "secp256k1",
      pubKey: cosmJsKeys[0].pubkey,
      address: Bech32Address.fromBech32(cosmJsKeys[0].address).address,
      bech32Address: cosmJsKeys[0].address,
      isNanoLedger: false,
    };
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getSecret20ViewingKey(): Promise<string> {
    throw new Error("Not implemented");
  }

  sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    return this.sendTxFn(chainId, stdTx, mode);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    const hdWallet = await this.getHdWallet(chainId);

    const keys = await hdWallet.getAccounts();
    if (keys[0].address !== signer) {
      throw new Error("Unmatched signer");
    }

    return hdWallet.signAmino(signer, signDoc);
  }

  signDirect(): Promise<DirectSignResponse> {
    throw new Error("Not implemented");
  }

  suggestToken(): Promise<void> {
    throw new Error("Not implemented");
  }

  getEnigmaTxEncryptionKey(
    _chainId: string,
    _nonce: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  getOfflineSignerAuto(
    _chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner> {
    throw new Error("Not implemented");
  }

  getOfflineSignerOnlyAmino(_chainId: string): OfflineSigner {
    throw new Error("Not implemented");
  }
}
