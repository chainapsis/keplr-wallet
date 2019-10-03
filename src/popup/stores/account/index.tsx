import { ChainInfo } from "../chain";

import { sendMessage } from "../../../common/message";
import { GetBech32AddressMsg } from "../../../background/keyring/export";

import { action, observable, flow } from "mobx";
import { BACKGROUND_PORT } from "../../../common/message/constant";

export class AccountStore {
  @observable
  private chainInfo!: ChainInfo;

  @observable
  public isAccountFetching!: boolean;

  @observable
  public bech32Address!: string;

  constructor() {
    this.init();
  }

  @action
  private init() {
    this.isAccountFetching = true;
    this.bech32Address = "";
  }

  // This will be called by chain store.
  @action
  public setChainInfo(info: ChainInfo) {
    this.chainInfo = info;

    this.fetchBech32Address();
  }

  @action
  private fetchBech32Address = flow(function*(this: AccountStore) {
    const bip44 = this.chainInfo.bip44;
    const prefix = this.chainInfo.bech32AddrPrefix;

    this.isAccountFetching = true;

    const path = bip44.pathString(0, 0);
    const msg = GetBech32AddressMsg.create(path, prefix);
    const result = yield sendMessage(BACKGROUND_PORT, msg);
    this.bech32Address = result.bech32Address as string;
    this.isAccountFetching = false;
  });
}
