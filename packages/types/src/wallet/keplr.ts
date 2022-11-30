import { ChainInfo } from "../chain-info";
import { EthSignType } from "../ethereum";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  OfflineSigner,
  StdSignature,
} from "@cosmjs/launchpad";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { SecretUtils } from "secretjs/types/enigmautils";
import Long from "long";

export interface Key {
  // Name of the selected key store.
  readonly name: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address: string;
  // Indicate whether the selected account is from the nano ledger.
  // Because current cosmos app in the nano ledger doesn't support the direct (proto) format msgs,
  // this can be used to select the amino or direct signer.
  readonly isNanoLedger: boolean;
}

export type KeplrMode = "core" | "extension" | "mobile-web" | "walletconnect";

export interface KeplrIntereactionOptions {
  readonly sign?: KeplrSignOptions;
}

export interface KeplrSignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;

  readonly disableBalanceCheck?: boolean;
}

export interface Keplr {
  readonly version: string;
  /**
   * mode means that how Keplr is connected.
   * If the connected Keplr is browser's extension, the mode should be "extension".
   * If the connected Keplr is on the mobile app with the embeded web browser, the mode should be "mobile-web".
   */
  readonly mode: KeplrMode;
  defaultOptions: KeplrIntereactionOptions;

  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
  enable(chainIds: string | string[]): Promise<void>;
  getKey(chainId: string): Promise<Key>;
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse>;
  signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      /** SignDoc bodyBytes */
      bodyBytes?: Uint8Array | null;

      /** SignDoc authInfoBytes */
      authInfoBytes?: Uint8Array | null;

      /** SignDoc chainId */
      chainId?: string | null;

      /** SignDoc accountNumber */
      accountNumber?: Long | null;
    },
    signOptions?: KeplrSignOptions
  ): Promise<DirectSignResponse>;
  sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array>;

  signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature>;
  verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean>;

  signEthereum(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array>;

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner;
  getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner>;

  suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void>;
  getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string>;
  getEnigmaUtils(chainId: string): SecretUtils;

  // Related to Enigma.
  // But, recommended to use `getEnigmaUtils` rather than using below.
  getEnigmaPubKey(chainId: string): Promise<Uint8Array>;
  getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array>;
  enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array>;
  enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array>;
}
