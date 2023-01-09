import { ChainInfo, ChainInfoWithoutEndpoints } from "../chain-info";
import { EthSignType } from "../ethereum";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  OfflineAminoSigner,
  StdSignature,
  DirectSignResponse,
  OfflineDirectSigner,
} from "../cosmjs";
import { SecretUtils } from "../secretjs";
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
  readonly isKeystone: boolean;
}

export type ICNSAdr36Signatures = {
  chainId: string;
  bech32Prefix: string;
  bech32Address: string;
  addressHash: "cosmos" | "ethereum";
  pubKey: Uint8Array;
  signatureSalt: number;
  signature: Uint8Array;
}[];

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
  /**
   * Delete permissions granted to origin.
   * If chain ids are specified, only the permissions granted to each chain id are deleted (In this case, permissions such as getChainInfosWithoutEndpoints() are not deleted).
   * Else, remove all permissions granted to origin (In this case, permissions that are not assigned to each chain, such as getChainInfosWithoutEndpoints(), are also deleted).
   *
   * @param chainIds disable(Remove approve domain(s)) target chain ID(s).
   */
  disable(chainIds?: string | string[]): Promise<void>;

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

  signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures>;

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

  getOfflineSigner(chainId: string): OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino(chainId: string): OfflineAminoSigner;
  getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineAminoSigner | OfflineDirectSigner>;

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

  /**
   * Sign the sign doc with ethermint's EIP-712 format.
   * The difference from signEthereum(..., EthSignType.EIP712) is that this api returns a new sign doc changed by the user's fee setting and the signature for that sign doc.
   * Encoding tx to EIP-712 format should be done on the side using this api.
   * Not compatible with cosmjs.
   * The returned signature is (r | s | v) format which used in ethereum.
   * v should be 27 or 28 which is used in the ethereum mainnet regardless of chain.
   * @param chainId
   * @param signer
   * @param eip712
   * @param signDoc
   * @param signOptions
   */
  experimentalSignEIP712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse>;

  getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]>;

  /** Change wallet extension user name **/
  changeKeyRingName(opts: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string>;
}
