import { autorun, flow, makeObservable, observable, toJS } from "mobx";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainGetter, HasMapStore } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { useState } from "react";

//const TEST_EXECUTE_CONTRACT = "osmo11111";

export interface ChildAccountSelectHandler {
  setRecipient(recipient: string): void;
  setPermission(permission: any): void;
}

export interface ChildAccountData {
  name: string;
  address: string;
  permission: any;
}

export class ChildAccountConfig {
  @observable
  protected _addressBookDatas: ChildAccountData[] = [];
  @observable
  protected _isLoaded: boolean = false;

  protected _selectHandler?: ChildAccountSelectHandler;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string
  ) {
    makeObservable(this);

    this.loadAddressBookDatas();
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  get addressBookDatas(): DeepReadonly<ChildAccountData[]> {
    return this._addressBookDatas;
  }

  setSelectHandler(handler: ChildAccountSelectHandler) {
    this._selectHandler = handler;
  }

  selectAddressAt(index: number) {
    const data = this.addressBookDatas[index];

    if (this._selectHandler) {
      this._selectHandler.setRecipient(data.address);
      this._selectHandler.setPermission(data.permission);
    }
  }

  @flow
  *addAddressBook(data: ChildAccountData) {
    yield this.loadAddressBookDatas();

    this._addressBookDatas.push(data);

    yield this.saveAddressBookDatas();
  }

  @flow
  *removeAddressBook(index: number) {
    yield this.loadAddressBookDatas();

    this._addressBookDatas.splice(index, 1);

    yield this.saveAddressBookDatas();
  }

  @flow
  *editAddressBookAt(index: number, data: ChildAccountData) {
    yield this.loadAddressBookDatas();

    this._addressBookDatas[index] = data;

    yield this.saveAddressBookDatas();
  }

  async saveAddressBookDatas() {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    await this.kvStore.set(
      ChildAccountConfig.keyForChainInfo(chainInfo),
      toJS(this._addressBookDatas)
    );
  }

  @flow
  *loadAddressBookDatas() {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const datas = yield* toGenerator(
      this.kvStore.get<ChildAccountData[]>(
        ChildAccountConfig.keyForChainInfo(chainInfo)
      )
    );
    if (!datas) {
      this._addressBookDatas = [];
    } else {
      this._addressBookDatas = datas;
    }

    this._isLoaded = true;
  }

  async waitLoaded(): Promise<void> {
    if (this._isLoaded) {
      return;
    }

    return new Promise<void>((resolve) => {
      const disposer = autorun(() => {
        if (this._isLoaded) {
          resolve();
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  static keyForChainInfo(chainInfo: ChainInfo): string {
    return `${chainInfo.chainName}`;
  }
}

export class ChildAccountConfigMap extends HasMapStore<ChildAccountConfig> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter
  ) {
    super((chainId: string) => {
      return new ChildAccountConfig(kvStore, chainGetter, chainId);
    });
  }

  getAddressBookConfig(chainId: string) {
    return this.get(chainId);
  }
}

export const useChildAccountConfig = (
  kvStore: KVStore,
  chainGetter: ChainGetter,
  chainId: string,
  handler: ChildAccountSelectHandler
) => {
  const [configMap] = useState(
    () => new ChildAccountConfigMap(kvStore, chainGetter)
  );

  const config = configMap.getAddressBookConfig(chainId);
  config.setSelectHandler(handler);

  return config;
};
