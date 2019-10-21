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
    if (chainInfo === null) {
      chainInfo = this.chainList[0];
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
