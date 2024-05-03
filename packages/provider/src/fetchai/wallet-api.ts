import {
  Account,
  AccountsApi,
  AddressBookApi,
  AddressBookEntry,
  NetworkConfig,
  NetworksApi,
  SigningApi,
  WalletApi,
  WalletStatus,
} from "@fetchai/wallet-types";
import {
  AminoSignResponse,
  DirectSignResponse,
  EthSignType,
  KeplrIntereactionOptions,
  KeplrSignOptions,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
  StdSignature,
} from "@keplr-wallet/types";
import deepmerge from "deepmerge";
import Long from "long";
import {
  CosmJSFetchOfflineSigner,
  CosmJSFetchOfflineSignerOnlyAmino,
  CosmJSFetchOfflineSignerOnlyDirect,
} from "../cosmjs";
import { Proxy, requestViaProxy } from "./proxy";
import {
  AccountsApiMethod,
  NetworksApiMethod,
  WalletSigningMethod,
  WalletMethod,
  AddressBookApiMethods,
} from "./types";

export class InjectedFetchWalletApi implements WalletApi {
  public networks: NetworksApi;
  public accounts: AccountsApi;
  public signing: SigningApi;
  public addressBook: AddressBookApi;

  constructor(protected readonly proxy: Proxy) {
    this.networks = new InjectedFetchNetworks(proxy);
    this.accounts = new InjectedFetchAccount(proxy);
    this.signing = new InjectedFetchSigning(proxy);
    this.addressBook = new InjectedFetchAddressBook(proxy);
  }

  async status(): Promise<WalletStatus> {
    return await this.requestViaProxy("status", []);
  }

  async unlockWallet(): Promise<void> {
    await this.requestViaProxy("unlockWallet", []);
  }

  async lockWallet(): Promise<void> {
    await this.requestViaProxy("lockWallet", []);
  }

  async restoreWallet(): Promise<WalletStatus> {
    return await this.requestViaProxy("restoreWallet", []);
  }

  async enable(chainIds: string | string[]): Promise<void> {
    return await this.requestViaProxy("enable", [chainIds]);
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    return await this.requestViaProxy("disable", [chainIds]);
  }

  protected async requestViaProxy(
    method: WalletMethod,
    args: any[]
  ): Promise<any> {
    return requestViaProxy(`wallet.${method}`, args, this.proxy);
  }
}

export class InjectedFetchAccount implements AccountsApi {
  constructor(protected readonly proxy: Proxy) {}

  /* This method will work when connection is established
   * with wallet therefore wallet will always give status "unlocked"
   */
  async currentAccount(): Promise<Account> {
    return await this.requestViaProxy("currentAccount", []);
  }

  async switchAccount(address: string): Promise<void> {
    await this.requestViaProxy("switchAccount", [address]);
  }

  async listAccounts(): Promise<Account[]> {
    return await this.requestViaProxy("listAccounts", []);
  }

  async getAccount(address: string): Promise<Account> {
    return await this.requestViaProxy("getAccount", [address]);
  }

  protected async requestViaProxy(
    method: AccountsApiMethod,
    args: any[]
  ): Promise<any> {
    return requestViaProxy(`wallet.accounts.${method}`, args, this.proxy);
  }
}

export class InjectedFetchNetworks implements NetworksApi {
  constructor(protected readonly proxy: Proxy) {}

  async getNetwork(): Promise<NetworkConfig> {
    return await this.requestViaProxy("getNetwork", []);
  }

  async switchToNetwork(network: NetworkConfig): Promise<void> {
    return await this.requestViaProxy("switchToNetwork", [network]);
  }

  async switchToNetworkByChainId(chainId: string): Promise<void> {
    return await this.requestViaProxy("switchToNetworkByChainId", [chainId]);
  }

  async listNetworks(): Promise<NetworkConfig[]> {
    return await this.requestViaProxy("listNetworks", []);
  }

  protected async requestViaProxy(
    method: NetworksApiMethod,
    args: any[]
  ): Promise<any> {
    return requestViaProxy(`wallet.networks.${method}`, args, this.proxy);
  }
}

export class InjectedFetchSigning implements SigningApi {
  constructor(protected readonly proxy: Proxy) {}

  public defaultOptions: KeplrIntereactionOptions = {};

  async getCurrentKey(chainId: string): Promise<Account> {
    const k = await this.requestViaProxy("getCurrentKey", [chainId]);
    return k;
  }

  async signEthereum(
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array> {
    return await this.requestViaProxy("signEthereum", [data, type]);
  }
  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    return await this.requestViaProxy("signAmino", [
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    signOptions: KeplrSignOptions = {}
  ): Promise<DirectSignResponse> {
    return await this.requestViaProxy("signDirect", [
      chainId,
      signer,
      // We can't send the `Long` with remaing the type.
      // Receiver should change the `string` to `Long`.
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return await this.requestViaProxy("signArbitrary", [chainId, signer, data]);
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return await this.requestViaProxy("verifyArbitrary", [
      chainId,
      signer,
      data,
      signature,
    ]);
  }

  async getOfflineSigner(
    chainId: string
  ): Promise<OfflineDirectSigner | OfflineAminoSigner> {
    return new CosmJSFetchOfflineSigner(chainId, this);
  }

  async getOfflineDirectSigner(chainId: string): Promise<OfflineDirectSigner> {
    return new CosmJSFetchOfflineSignerOnlyDirect(chainId, this);
  }

  async getOfflineAminoSigner(chainId: string): Promise<OfflineAminoSigner> {
    return new CosmJSFetchOfflineSignerOnlyAmino(chainId, this);
  }

  protected async requestViaProxy(
    method: WalletSigningMethod,
    args: any[]
  ): Promise<any> {
    return requestViaProxy(`wallet.signing.${method}`, args, this.proxy);
  }
}

export class InjectedFetchAddressBook implements AddressBookApi {
  constructor(protected readonly proxy: Proxy) {}

  /* This method will work when connection is established
   * with wallet therefore wallet will always give status "unlocked"
   */
  async listEntries(): Promise<AddressBookEntry[]> {
    return await this.requestViaProxy("listEntries", []);
  }

  async addEntry(entry: AddressBookEntry): Promise<void> {
    await this.requestViaProxy("addEntry", [entry]);
  }

  async updateEntry(entry: AddressBookEntry): Promise<void> {
    return await this.requestViaProxy("updateEntry", [entry]);
  }

  async deleteEntry(address: string): Promise<void> {
    return await this.requestViaProxy("deleteEntry", [address]);
  }

  protected async requestViaProxy(
    method: AddressBookApiMethods,
    args: any[]
  ): Promise<any> {
    return requestViaProxy(`wallet.addressBook.${method}`, args, this.proxy);
  }
}
