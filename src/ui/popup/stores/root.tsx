import { ChainStore } from "./chain";
import { KeyRingStatus, KeyRingStore } from "./keyring";
import { AccountStore } from "./account";
import { ChainInfo } from "../../../background/chains";
import { PriceStore } from "./price";
import { EmbedChainInfos } from "../../../config";
import { QueriesStore } from "./query";
import { BrowserKVStore } from "../../../common/kvstore";
import { IBCStore } from "./ibc";

export class RootStore {
  public chainStore: ChainStore;
  public keyRingStore: KeyRingStore;
  public accountStore: AccountStore;
  public priceStore: PriceStore;

  public queriesStore: QueriesStore;
  public ibcStore: IBCStore;

  constructor() {
    // Order is important.
    this.ibcStore = new IBCStore(new BrowserKVStore("store-ibc"));
    this.accountStore = new AccountStore(this, this.ibcStore);
    this.keyRingStore = new KeyRingStore(this);
    this.priceStore = new PriceStore();

    this.chainStore = new ChainStore(this, this.ibcStore, EmbedChainInfos);

    this.queriesStore = new QueriesStore(
      new BrowserKVStore("queries"),
      this.chainStore
    );
    this.ibcStore.init(this.queriesStore, this.chainStore);

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

  public async refreshChainList(): Promise<void> {
    await this.chainStore.refreshChainList();
  }

  public changeKeyRing() {
    this.accountStore.changeKeyRing();
  }
}

export function createRootStore() {
  return new RootStore();
}
