import { ChainInfo } from "../../../../../background/chains";
import { AddressBookData } from "./types";
import { KVStore } from "../../../../../common/kvstore";

export class AddressBookKVStore {
  constructor(private kvStore: KVStore) {}

  async addAddressBook(chainInfo: ChainInfo, data: AddressBookData) {
    const addressBook = await this.getAddressBook(chainInfo);
    addressBook.push(data);
    await this.kvStore.set(
      AddressBookKVStore.keyForChainInfo(chainInfo),
      addressBook
    );
  }

  async removeAddressBook(chainInfo: ChainInfo, index: number) {
    let addressBook = await this.getAddressBook(chainInfo);
    addressBook = addressBook
      .slice(0, index)
      .concat(addressBook.slice(index + 1));
    await this.kvStore.set(
      AddressBookKVStore.keyForChainInfo(chainInfo),
      addressBook
    );
  }

  async getAddressBook(chainInfo: ChainInfo): Promise<AddressBookData[]> {
    let addressBook = await this.kvStore.get<AddressBookData[]>(
      AddressBookKVStore.keyForChainInfo(chainInfo)
    );
    if (!addressBook) {
      addressBook = [];
    }
    return addressBook;
  }

  static keyForChainInfo(chainInfo: ChainInfo): string {
    return `${chainInfo.chainName}`;
  }
}
