import { observable, action } from "mobx";
import { actionAsync, task } from "mobx-utils";

import { RootStore } from "../root";

import { ChainInfo } from "../../../../background/chains";
import {
  SetPersistentMemoryMsg,
  GetPersistentMemoryMsg
} from "../../../../background/persistent-memory";
import { GetChainInfosMsg } from "../../../../background/chains/messages";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;

  // Indicate whether the chain info is set.
  private isChainSet = false;

  constructor(
    private rootStore: RootStore,
    private readonly embedChainInfos: ChainInfo[]
  ) {
    this.setChainList(this.embedChainInfos);

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
    const msg = SetPersistentMemoryMsg.create({
      lastViewChainId: this.chainInfo.chainId
    });
    await task(sendMessage(BACKGROUND_PORT, msg));
  }

  @actionAsync
  public async init() {
    await task(this.getChainInfosFromBackground());

    // Get last view chain id to persistent background
    const msg = GetPersistentMemoryMsg.create();
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
    const msg = GetChainInfosMsg.create();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    const chainInfos: ChainInfo[] = result.chainInfos.map(
      (chainInfo: Writeable<ChainInfo>) => {
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
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }
}
