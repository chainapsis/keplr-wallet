import { ChainInfo, Keplr as IKeplr, KeyHex } from "@keplr/types";
import { BACKGROUND_PORT, MessageRequester } from "@keplr/router";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
} from "@cosmjs/launchpad";
import {
  EnableKeyRingMsg,
  SuggestChainInfoMsg,
  GetKeyMsg,
  SuggestTokenMsg,
  SendTxMsg,
  GetSecret20ViewingKey,
  RequestSignAminoMsg,
} from "@keplr/background";
import { SecretUtils } from "secretjs/types/enigmautils";

import { KeplrEnigmaUtils } from "./enigma";

export class Keplr implements IKeplr {
  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  constructor(protected readonly requester: MessageRequester) {}

  async enable(chainId: string): Promise<void> {
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new EnableKeyRingMsg(chainId)
    );
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    const msg = new SuggestChainInfoMsg(chainInfo);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getKey(chainId: string): Promise<KeyHex> {
    const msg = new GetKeyMsg(chainId);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    const msg = new SendTxMsg(chainId, stdTx, mode);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    const msg = new RequestSignAminoMsg(chainId, signer, signDoc);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async suggestToken(chainId: string, contractAddress: string): Promise<void> {
    const msg = new SuggestTokenMsg(chainId, contractAddress);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    const msg = new GetSecret20ViewingKey(chainId, contractAddress);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  getEnigmaUtils(chainId: string): SecretUtils {
    if (this.enigmaUtils.has(chainId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.enigmaUtils.get(chainId)!;
    }

    const enigmaUtils = new KeplrEnigmaUtils(chainId, this.requester);
    this.enigmaUtils.set(chainId, enigmaUtils);
    return enigmaUtils;
  }
}
