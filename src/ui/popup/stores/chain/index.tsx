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
import { Currency } from "../../../../common/currency";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ChainStore {
  @observable public chainList!: ChainInfoWithEmbed[];

  @observable
  public chainInfo!: ChainInfo;

  @observable
  public allCurrencies!: Currency[];

  // Indicate whether the chain store is initializing.
  private isIntializing = false;

  // Defer setting chain right after init is complete.
  private deferChainSet: string = "";

  constructor(
    private rootStore: RootStore,
    private readonly embedChainInfos: ChainInfo[]
  ) {
    this.setAllCurrencies([]);

    this.setChainList(
      this.embedChainInfos.map(chainInfo => {
        return {
          ...chainInfo,
          embeded: true
        };
      })
    );

    this.setChain(this.chainList[0].chainId);
  }

  @action
  public setChain(chainId: string) {
    if (this.chainInfo && this.chainInfo.chainId === chainId) {
      // No need to change chain info.
      return;
    }

    if (this.isIntializing) {
      this.deferChainSet = chainId;
    }

    let chainInfo: ChainInfo | null = null;
    for (const ci of this.chainList) {
      if (ci.chainId === chainId) {
        chainInfo = ci;
      }
    }
    // If no match chain id, throw error.
    if (chainInfo === null) {
      if (this.isIntializing) {
        // If store is still initializing, don't throw and defer it.
        return;
      }

      throw new Error("Invalid chain id");
    }

    this.chainInfo = chainInfo;

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
    this.isIntializing = true;
    await task(this.getChainInfosFromBackground());

    // Get last view chain id to persistent background
    const msg = new GetPersistentMemoryMsg();
    const result = await task(sendMessage(BACKGROUND_PORT, msg));
    if (result && result.lastViewChainId) {
      // If setting chain info is defered, skip setting the last used chain info.
      if (!this.deferChainSet) {
        this.setChain(result.lastViewChainId);
      }
    }
    this.isIntializing = false;

    if (this.deferChainSet) {
      this.setChain(this.deferChainSet);
      this.deferChainSet = "";
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

    const allCurrencies = chainList
      .map(chainInfo => {
        return chainInfo.currencies;
      })
      // Flaten
      .reduce((acc, val) => {
        return acc.concat(val);
      }, []);

    this.setAllCurrencies(allCurrencies);
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

  @action
  public setAllCurrencies(currencies: Currency[]) {
    this.allCurrencies = currencies;
  }
}
