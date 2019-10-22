import { observable, action } from "mobx";

import { RootStore } from "../root";

import { ChainInfo } from "../../../../chain-info";
import { SupportedChainInfos } from "../../supported-chain";

export class ChainStore {
  @observable public chainList!: ChainInfo[];

  @observable
  public chainInfo!: ChainInfo;

  // Force ignoring unused root store.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  constructor(private rootStore: RootStore) {
    this.setChainList(SupportedChainInfos);

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
    this.rootStore.walletUIStore.setChainInfo(chainInfo);
  }

  @action
  public setChainList(chainList: ChainInfo[]) {
    this.chainList = chainList;
  }
}
