import { observable, action } from "mobx";

import { RootStore } from "../root";

import { ChainInfo, NativeChainInfos } from "../../../../chain-info";

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;

  constructor(private rootStore: RootStore) {
    this.setChainList(NativeChainInfos);

    this.setChain(this.chainList[0].chainId);
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

    this.rootStore.keyRingStore.setChainInfo(chainInfo);
    this.rootStore.accountStore.setChainInfo(chainInfo);
  }

  @action
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }
}
