import { AddressBookEntry } from "@fetchai/wallet-types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { ChainsService } from "src/chains";
import { PermissionService } from "src/permission";

export class AddressBookService {
  protected addressBook: AddressBookEntry[] = [];
  protected kvStore: ExtensionKVStore;

  public chainService!: ChainsService;
  public permissionService!: PermissionService;
  constructor(
    chainService: ChainsService,
    permissionService: PermissionService
  ) {
    this.chainService = chainService;
    this.kvStore = new ExtensionKVStore("address-book");
    this.permissionService = permissionService;
  }

  public async listEntries() {
    const chainInfo = await this.chainService.getChainInfo(
      await this.chainService.getSelectedChain()
    );
    const addressBook = await this.kvStore.get(`${chainInfo.chainName}`);
    return addressBook as AddressBookEntry[];
  }

  public async addEntry(entry: AddressBookEntry) {
    const chainInfo = await this.chainService.getChainInfo(
      await this.chainService.getSelectedChain()
    );
    const addressBook: AddressBookEntry[] | undefined =
      (await this.kvStore.get(`${chainInfo.chainName}`)) ?? [];

    const entryExists = addressBook.find((a) => {
      return a.address === entry.address;
    });

    if (!entryExists) {
      addressBook.push(entry);
      await this.kvStore.set(`${chainInfo.chainName}`, addressBook);
    }
  }

  public async updateEntry(entry: AddressBookEntry) {
    const chainInfo = await this.chainService.getChainInfo(
      await this.chainService.getSelectedChain()
    );
    const addressBook: AddressBookEntry[] | undefined =
      (await this.kvStore.get(`${chainInfo.chainName}`)) ?? [];

    const updatedAddressBook = addressBook.map((_entry) => {
      if (_entry.address === entry.address || _entry.name === entry.name) {
        return entry;
      } else {
        return _entry;
      }
    });

    await this.kvStore.set(`${chainInfo.chainName}`, updatedAddressBook);
  }

  public async deleteEntry(address: string) {
    const chainInfo = await this.chainService.getChainInfo(
      await this.chainService.getSelectedChain()
    );
    const addressBook: AddressBookEntry[] | undefined =
      (await this.kvStore.get(`${chainInfo.chainName}`)) ?? [];

    const updatedAddressBook = addressBook.filter((entry) => {
      return entry.address !== address;
    });

    await this.kvStore.set(`${chainInfo.chainName}`, updatedAddressBook);
  }
}
