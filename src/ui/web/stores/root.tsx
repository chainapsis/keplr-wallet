import { ChainStore } from "./chain";
import { WalletUIStore } from "./wallet-ui";

export class RootStore {
  public chainStore: ChainStore;
  public walletUIStore: WalletUIStore;

  constructor() {
    this.walletUIStore = new WalletUIStore(this);
    this.chainStore = new ChainStore(this);
  }
}

export function createRootStore() {
  return new RootStore();
}
