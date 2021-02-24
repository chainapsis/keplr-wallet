import { ChainInfo } from "../chain-info";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
} from "@cosmjs/launchpad";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { SecretUtils } from "secretjs/types/enigmautils";
import Long from "long";

// TODO: Return the `Uint8Array` instead of hex string.
export interface KeyHex {
  // Name of the selected key store.
  readonly name: string;
  readonly algo: string;
  readonly pubKeyHex: string;
  readonly addressHex: string;
  readonly bech32Address: string;
}

export interface Keplr {
  experimentalSuggestChain(chainInfo: ChainInfo): Promise<void>;
  enable(chainId: string): Promise<void>;
  getKey(chainId: string): Promise<KeyHex>;
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
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
    }
  ): Promise<DirectSignResponse>;
  sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<Uint8Array>;
  suggestToken(chainId: string, contractAddress: string): Promise<void>;
  getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string>;
  getEnigmaUtils(chainId: string): SecretUtils;
}
