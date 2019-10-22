import { ChainInfo } from "../../../../chain-info";

import { action, computed, observable } from "mobx";
import { RootStore } from "../root";
import { Menu, SupportedChainWalletUIs, WalletUI } from "../../supported-chain";

export class WalletUIStore {
  @observable
  public walletUI!: WalletUI;

  @observable
  public walletUIList!: WalletUI[];

  @observable
  public path: string | undefined;

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  constructor(private rootStore: RootStore) {
    this.setWalletUIList(SupportedChainWalletUIs);
  }

  // This will be called by chain store.
  @action
  public setChainInfo(info: ChainInfo) {
    const chainId = info.chainId;

    const walletUI = this.walletUIList.find(walletUI => {
      return walletUI.chainId === chainId;
    });

    if (!walletUI) {
      throw new Error("Invalid chain id for wallet ui");
    }

    this.setWalletUI(walletUI);
  }

  @action
  public setWalletUI(walletUI: WalletUI) {
    this.walletUI = walletUI;
  }

  @action
  private setWalletUIList(walletUIList: WalletUI[]) {
    this.walletUIList = walletUIList;
  }

  @action
  public setPath(path: string | undefined) {
    this.path = path;
  }

  @computed
  public get currentMenu(): Menu | undefined {
    return this.walletUI.menus.find(menu => {
      return menu.path === this.path;
    });
  }
}
