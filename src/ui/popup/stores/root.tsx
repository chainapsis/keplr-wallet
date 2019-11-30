import { ChainStore } from "./chain";
import { KeyRingStatus, KeyRingStore } from "./keyring";
import { AccountStore } from "./account";
import { ChainInfo } from "../../../chain-info";
import { PriceStore } from "./price";

export class RootStore {
  public chainStore: ChainStore;
  public keyRingStore: KeyRingStore;
  public accountStore: AccountStore;
  public priceStore: PriceStore;

  constructor() {
    // Order is important.
    this.accountStore = new AccountStore(this);
    this.keyRingStore = new KeyRingStore(this);
    this.priceStore = new PriceStore();
    this.chainStore = new ChainStore(this);

    this.chainStore.init();
    this.keyRingStore.restore();
  }

  public setChainInfo(info: ChainInfo) {
    this.accountStore.setChainInfo(info);
    this.keyRingStore.setChainInfo(info);
    this.priceStore.setChainInfo(info);
  }

  public setKeyRingStatus(status: KeyRingStatus) {
    this.accountStore.setKeyRingStatus(status);
  }
}

export function createRootStore() {
  return new RootStore();
}
