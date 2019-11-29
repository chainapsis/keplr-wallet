import { ChainStore } from "./chain";
import { WalletUIStore } from "./wallet-ui";
import { ChainInfo } from "../../../chain-info";

export class RootStore {
  public chainStore: ChainStore;
  public walletUIStore: WalletUIStore;

  constructor() {
    this.walletUIStore = new WalletUIStore(this);
    this.chainStore = new ChainStore(this);
  }

  public setChainInfo(info: ChainInfo) {
    this.walletUIStore.setChainInfo(info);
  }
}

export function createRootStore() {
  return new RootStore();
}
