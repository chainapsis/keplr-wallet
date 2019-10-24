import { ChainStore } from "./chain";
import { KeyRingStore } from "./keyring";
import { AccountStore } from "./account";

export class RootStore {
  public chainStore: ChainStore;
  public keyRingStore: KeyRingStore;
  public accountStore: AccountStore;

  constructor() {
    // Order is important.
    this.accountStore = new AccountStore(this);
    this.keyRingStore = new KeyRingStore(this);
    this.chainStore = new ChainStore(this);

    this.chainStore.getChainInfosFromBackground();
    this.keyRingStore.restore();
  }
}

export function createRootStore() {
  return new RootStore();
}
