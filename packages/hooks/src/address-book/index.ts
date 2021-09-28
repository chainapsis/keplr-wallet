import { autorun, flow, makeObservable, observable, toJS } from "mobx";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainGetter, HasMapStore } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { useState } from "react";

export interface AddressBookSelectHandler {
  setRecipient(recipient: string): void;
  setMemo(memo: string): void;
}

export interface AddressBookData {
  name: string;
  address: string;
  memo: string;
}

export class AddressBookConfig {
  @observable
  protected _addressBookDatas: AddressBookData[] = [];
  @observable
  protected _isLoaded: boolean = false;

  protected _selectHandler?: AddressBookSelectHandler;

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

  get addressBookDatas(): DeepReadonly<AddressBookData[]> {
    return this._addressBookDatas;
  }

  setSelectHandler(handler: AddressBookSelectHandler) {
    this._selectHandler = handler;
  }

  selectAddressAt(index: number) {
    const data = this.addressBookDatas[index];

    if (this._selectHandler) {
      this._selectHandler.setRecipient(data.address);
      this._selectHandler.setMemo(data.memo);
    }
  }

  @flow
  *addAddressBook(data: AddressBookData) {
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
  *editAddressBookAt(index: number, data: AddressBookData) {
    yield this.loadAddressBookDatas();

    this._addressBookDatas[index] = data;

    yield this.saveAddressBookDatas();
  }

  async saveAddressBookDatas() {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    await this.kvStore.set(
      AddressBookConfig.keyForChainInfo(chainInfo),
      toJS(this._addressBookDatas)
    );
  }

  @flow
  *loadAddressBookDatas() {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const datas = yield* toGenerator(
      this.kvStore.get<AddressBookData[]>(
        AddressBookConfig.keyForChainInfo(chainInfo)
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

export class AddressBookConfigMap extends HasMapStore<AddressBookConfig> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter
  ) {
    super((chainId: string) => {
      return new AddressBookConfig(kvStore, chainGetter, chainId);
    });
  }

  getAddressBookConfig(chainId: string) {
    return this.get(chainId);
  }
}

export const useAddressBookConfig = (
  kvStore: KVStore,
  chainGetter: ChainGetter,
  chainId: string,
  handler: AddressBookSelectHandler
) => {
  const [configMap] = useState(
    () => new AddressBookConfigMap(kvStore, chainGetter)
  );

  const config = configMap.getAddressBookConfig(chainId);
  config.setSelectHandler(handler);

  return config;
};
