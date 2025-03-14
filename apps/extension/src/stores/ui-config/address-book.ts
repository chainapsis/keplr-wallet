import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";
import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { ChainStore } from "../chain";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import {
  Key,
  SettledResponses,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import {
  GetCosmosKeysForEachVaultSettledMsg,
  RecentSendHistory,
  GetRecentSendHistoriesMsg,
  GetCosmosKeysForEachVaultWithSearchSettledMsg,
  GetStarknetKeysForEachVaultSettledMsg,
  GetBitcoinKeysForEachVaultSettledMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { KeyRingStore } from "@keplr-wallet/stores-core";

export interface AddressBookData {
  name: string;
  address: string;
  memo: string;
}

export class AddressBookConfig {
  protected readonly legacyKVStore: KVStore;
  protected readonly kvStore: KVStore;

  @observable
  protected readonly addressBookMap = new Map<string, AddressBookData[]>();

  constructor(
    kvStore: KVStore,
    protected readonly messageRequester: MessageRequester,
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);

    this.legacyKVStore = kvStore;
    this.kvStore = new PrefixKVStore(kvStore, "v2");
  }

  async init(): Promise<void> {
    await this.chainStore.waitUntilInitialized();

    const migrated = await this.kvStore.get<boolean>("migrated/v2");
    if (!migrated) {
      await this.migrateLegacy();
      await this.kvStore.set<boolean>("migrated/v2", true);
    }

    const saved = await this.kvStore.get<Record<string, AddressBookData[]>>(
      "addressBook"
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.addressBookMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.addressBookMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, AddressBookData[]>>("addressBook", obj);
    });

    // Sync and clear the config if the chain is removed.
    autorun(() => {
      const chainIdentifierMap = new Map<string, boolean>();
      for (const chainInfo of this.chainStore.chainInfos) {
        chainIdentifierMap.set(chainInfo.chainIdentifier, true);
      }
      for (const starknetChainInfo of this.chainStore.modularChainInfos.filter(
        (modularChainInfo) => "starknet" in modularChainInfo
      )) {
        chainIdentifierMap.set(
          ChainIdHelper.parse(starknetChainInfo.chainId).identifier,
          true
        );
      }
      runInAction(() => {
        const chainIdentifiers = Array.from(this.addressBookMap.keys());
        for (const chainIdentifier of chainIdentifiers) {
          if (!chainIdentifierMap.has(chainIdentifier)) {
            this.addressBookMap.delete(chainIdentifier);
          }
        }
      });
    });
  }

  getAddressBook(chainId: string): AddressBookData[] {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    return this.addressBookMap.get(identifier) ?? [];
  }

  addAddressBook(chainId: string, data: AddressBookData) {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    const addressBook = this.addressBookMap.get(identifier);
    if (!addressBook) {
      this.addressBookMap.set(identifier, [data]);
    } else {
      addressBook.push(data);
    }
  }

  setAddressBookAt(chainId: string, index: number, data: AddressBookData) {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    const addressBook = this.addressBookMap.get(identifier);
    // TODO: 오류를 던져야하나?
    if (!addressBook) {
      return;
    }
    if (addressBook.length <= index) {
      return;
    }
    addressBook[index] = data;
  }

  removeAddressBookAt(chainId: string, index: number) {
    const identifier = ChainIdHelper.parse(chainId).identifier;
    const addressBook = this.addressBookMap.get(identifier);
    if (!addressBook) {
      return;
    }
    addressBook.splice(index, 1);
  }

  async getRecentSendHistory(
    chainId: string,
    type: string
  ): Promise<RecentSendHistory[]> {
    const msg = new GetRecentSendHistoriesMsg(chainId, type);
    return await this.messageRequester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getVaultCosmosKeysSettled(
    chainId: string,
    exceptVaultId?: string
  ): Promise<
    SettledResponses<
      Key & {
        vaultId: string;
      }
    >
  > {
    const vaultIds = this.keyRingStore.keyInfos
      .map((keyInfo) => keyInfo.id)
      .filter((vault) => vault !== exceptVaultId);

    if (vaultIds.length === 0) {
      return [];
    }

    const msg = new GetCosmosKeysForEachVaultSettledMsg(chainId, vaultIds);
    return await this.messageRequester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getVaultStarknetKeysSettled(
    chainId: string,
    exceptVaultId?: string
  ): Promise<
    SettledResponses<
      {
        name: string;
        hexAddress: string;
        pubKey: Uint8Array;
        address: Uint8Array;
        isNanoLedger: boolean;
      } & {
        vaultId: string;
      }
    >
  > {
    const vaultIds = this.keyRingStore.keyInfos
      .map((keyInfo) => keyInfo.id)
      .filter((vault) => vault !== exceptVaultId);

    if (vaultIds.length === 0) {
      return [];
    }

    const msg = new GetStarknetKeysForEachVaultSettledMsg(chainId, vaultIds);
    return await this.messageRequester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getVaultBitcoinKeysSettled(
    chainId: string,
    exceptVaultId?: string
  ): Promise<
    SettledResponses<
      {
        name: string;
        pubKey: Uint8Array;
        address: string;
        paymentType: SupportedPaymentType;
        isNanoLedger: boolean;
      } & {
        vaultId: string;
      }
    >
  > {
    const vaultIds = this.keyRingStore.keyInfos
      .map((keyInfo) => keyInfo.id)
      .filter((vault) => vault !== exceptVaultId);

    if (vaultIds.length === 0) {
      return [];
    }

    const msg = new GetBitcoinKeysForEachVaultSettledMsg(chainId, vaultIds);
    return await this.messageRequester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getVaultCosmosKeysWithSearchSettled(
    searchText: string,
    chainId: string,
    exceptVaultId?: string
  ): Promise<
    SettledResponses<
      Key & {
        vaultId: string;
      }
    >
  > {
    const vaultIds = this.keyRingStore.keyInfos
      .map((keyInfo) => keyInfo.id)
      .filter((vault) => vault !== exceptVaultId);

    if (vaultIds.length === 0) {
      return [];
    }

    const msg = new GetCosmosKeysForEachVaultWithSearchSettledMsg(
      chainId,
      vaultIds,
      searchText
    );
    return await this.messageRequester.sendMessage(BACKGROUND_PORT, msg);
  }

  protected async migrateLegacy(): Promise<void> {
    for (const chainInfo of this.chainStore.chainInfos) {
      const addressBook = await this.legacyKVStore.get<AddressBookData[]>(
        // 초기버전에서 이걸 chain name으로 했었는데 이건 잘못된 선택이였음.
        chainInfo.chainName
      );
      if (addressBook) {
        this.addressBookMap.set(chainInfo.chainIdentifier, addressBook);
      }
    }
  }
}
