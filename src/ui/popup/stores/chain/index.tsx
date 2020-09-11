import { observable, action } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { RootStore } from "../root";

import { ChainInfo, ChainInfoWithEmbed } from "../../../../background/chains";
import {
  SetPersistentMemoryMsg,
  GetPersistentMemoryMsg
} from "../../../../background/persistent-memory";
import {
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  TryUpdateChainMsg
} from "../../../../background/chains/messages";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainStore {
  @observable public chainList!: ChainInfoWithEmbed[];

  @observable
  public chainInfo!: ChainInfo;

  // Indicate whether the chain info is set.
  private isChainSet = false;

  constructor(
    private rootStore: RootStore,
    private readonly embedChainInfos: ChainInfo[]
  ) {
    this.setChainList(
      this.embedChainInfos.map(chainInfo => {
        return {
          ...chainInfo,
          embeded: true
        };
      })
    );

    this.setChain(this.chainList[0].chainId);
    this.isChainSet = false;
  }

  @action
  public setChain(chainId: string) {
    let chainInfo: ChainInfo | null = null;
    for (const ci of this.chainList) {
      if (ci.chainId === chainId) {
        chainInfo = ci;
      }
    }
    // If no match chain id, throw error.
    if (chainInfo === null) {
      throw new Error("Invalid chain id");
    }

    this.chainInfo = chainInfo;
    this.isChainSet = true;

    this.rootStore.setChainInfo(chainInfo);
  }

  @actionAsync
  public async saveLastViewChainId() {
    // Save last view chain id to persistent background
    const msg = new SetPersistentMemoryMsg({
      lastViewChainId: this.chainInfo.chainId
    });
    await task(sendMessage(BACKGROUND_PORT, msg));
  }

  @actionAsync
  public async init() {
    await task(this.getChainInfosFromBackground());

    // Get last view chain id to persistent background
    const msg = new GetPersistentMemoryMsg();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    if (result && result.lastViewChainId) {
      // If chain info is already set, skip setting the last used chain info.
      if (!this.isChainSet) {
        this.setChain(result.lastViewChainId);
      }
    }
  }

  @actionAsync
  private async getChainInfosFromBackground() {
    const msg = new GetChainInfosMsg();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    const chainInfos = result.chainInfos.map(
      (chainInfo: Writeable<ChainInfoWithEmbed>) => {
        chainInfo.bip44 = Object.setPrototypeOf(
          chainInfo.bip44,
          BIP44.prototype
        );
        return chainInfo;
      }
    );
    this.setChainList(chainInfos);
  }

  @action
  public setChainList(chainList: ChainInfoWithEmbed[]) {
    this.chainList = chainList;
  }

  @actionAsync
  public async removeChainInfo(chainId: string) {
    const msg = new RemoveSuggestedChainInfoMsg(chainId);
    const chainInfos = await task(sendMessage(BACKGROUND_PORT, msg));

    this.setChainList(chainInfos);
    // If currently selected chain is removed, just set the chain as first one.
    if (chainId === this.chainInfo.chainId) {
      this.setChain(chainInfos[0].chainId);
    }
  }

  @actionAsync
  public async tryUpdateChain(chainId: string) {
    const selected = chainId === this.chainInfo.chainId;

    const msg = new TryUpdateChainMsg(chainId);
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    this.setChainList(result.chainInfos);
    if (selected) {
      this.setChain(result.chainId);
      await this.saveLastViewChainId();
    }
  }
}
