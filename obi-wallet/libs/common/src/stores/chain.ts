import { computed, makeObservable, observable } from "mobx";

import { Chain, chains } from "../chains";

export class ChainStore {
  @observable
  public currentChain: Chain;

  constructor({ defaultChain }: { defaultChain: Chain }) {
    this.currentChain = defaultChain;
    makeObservable(this);
  }

  @computed
  public get currentChainInformation() {
    return chains[this.currentChain];
  }
}
