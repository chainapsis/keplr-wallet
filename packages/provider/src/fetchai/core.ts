import {
  KeplrIntereactionOptions,
  KeplrSignOptions,
  AminoSignResponse,
  StdSignDoc,
  OfflineAminoSigner,
  StdSignature,
  DirectSignResponse,
  OfflineDirectSigner,
  EthSignType,
} from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  EnableAccessMsg,
  StatusMsg,
  UnlockWalletMsg,
  LockWalletMsg,
  SwitchAccountMsg,
  ListAccountsMsg,
  GetNetworkMsg,
  ListNetworksMsg,
  CurrentAccountMsg,
  RequestSignAminoMsgFetchSigning,
  RequestSignDirectMsgFetchSigning,
  RequestVerifyADR36AminoSignDocFetchSigning,
  AddNetworkAndSwitchMsg,
  SwitchNetworkByChainIdMsg,
  GetAccountMsg,
  ListEntriesMsg,
  AddEntryMsg,
  UpdateEntryMsg,
  DeleteEntryMsg,
  RestoreWalletMsg,
  GetKeyMsgFetchSigning,
  DisableAccessMsg,
} from "../types";
import deepmerge from "deepmerge";

import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { Keplr } from "@keplr-wallet/types";
import {
  FetchBrowserWallet,
  Account,
  AccountsApi,
  NetworksApi,
  SigningApi,
  WalletApi,
  WalletStatus,
  AddressBookApi,
  AddressBookEntry,
  NetworkConfig,
} from "@fetchai/wallet-types";

import {
  CosmJSFetchOfflineSigner,
  CosmJSFetchOfflineSignerOnlyAmino,
  CosmJSFetchOfflineSignerOnlyDirect,
} from "../cosmjs";

import Long from "long";

export class FetchWalletApi implements WalletApi {
  constructor(
    public networks: NetworksApi,
    public accounts: AccountsApi,
    public signing: SigningApi,
    public addressBook: AddressBookApi,
    protected readonly requester: MessageRequester
  ) {}

  async status(): Promise<WalletStatus> {
    return await this.requester.sendMessage(BACKGROUND_PORT, new StatusMsg());
  }

  async unlockWallet(): Promise<void> {
    await this.requester.sendMessage(BACKGROUND_PORT, new UnlockWalletMsg());
  }

  async lockWallet(): Promise<void> {
    await this.requester.sendMessage(BACKGROUND_PORT, new LockWalletMsg());
  }

  async restoreWallet(): Promise<WalletStatus> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new RestoreWalletMsg()
    );
  }

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new EnableAccessMsg(chainIds)
    );
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new DisableAccessMsg(chainIds ?? [])
    );
  }
}

export class FetchAccount implements AccountsApi {
  constructor(protected readonly requester: MessageRequester) {}

  async currentAccount(): Promise<Account> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new CurrentAccountMsg()
    );
  }

  async switchAccount(address: string): Promise<void> {
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new SwitchAccountMsg(address)
    );
  }

  async listAccounts(): Promise<Account[]> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new ListAccountsMsg()
    );
  }

  async getAccount(address: string): Promise<Account | null> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetAccountMsg(address)
    );
  }
}

export class FetchNetworks implements NetworksApi {
  constructor(protected readonly requester: MessageRequester) {}

  async getNetwork(): Promise<NetworkConfig> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetNetworkMsg()
    );
  }

  async switchToNetwork(network: NetworkConfig): Promise<void> {
    // Add network
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new AddNetworkAndSwitchMsg(network)
    );

    // enable access
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new EnableAccessMsg([network.chainId])
    );
  }

  async switchToNetworkByChainId(chainId: string): Promise<void> {
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new SwitchNetworkByChainIdMsg(chainId)
    );
  }

  async listNetworks(): Promise<NetworkConfig[]> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new ListNetworksMsg()
    );
  }
}

export class FetchSigning implements SigningApi {
  public defaultOptions: KeplrIntereactionOptions = {};

  constructor(protected readonly requester: MessageRequester) {}

  async getCurrentKey(chainId: string): Promise<Account> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetKeyMsgFetchSigning(chainId)
    );
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    const msg = new RequestSignAminoMsgFetchSigning(
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
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
    const msg = new RequestSignDirectMsgFetchSigning(
      chainId,
      signer,
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    const response = await this.requester.sendMessage(BACKGROUND_PORT, msg);

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: Long.fromString(response.signed.accountNumber),
      },
      signature: response.signature,
    };
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    let isADR36WithString: boolean;
    [data, isADR36WithString] = this.getDataForADR36(data);
    const signDoc = this.getADR36SignDoc(signer, data);
    const msg = new RequestSignAminoMsgFetchSigning(chainId, signer, signDoc, {
      isADR36WithString,
    });
    const signData = await this.requester.sendMessage(BACKGROUND_PORT, msg);
    return signData.signature;
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    if (typeof data === "string") {
      data = Buffer.from(data);
    }

    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new RequestVerifyADR36AminoSignDocFetchSigning(
        chainId,
        signer,
        data,
        signature
      )
    );
  }

  async signEthereum(
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array> {
    let isADR36WithString: boolean;
    [data, isADR36WithString] = this.getDataForADR36(data);

    const network = await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetNetworkMsg()
    );
    const chainId = network.chainId;
    const key = await this.getCurrentKey(chainId);

    let signer;
    if (key.bech32Address) {
      signer = key.bech32Address;
    } else {
      signer = new Bech32Address(key.address).toBech32(
        network.bech32Config.bech32PrefixAccAddr
      );
    }

    const signDoc = this.getADR36SignDoc(signer, data);

    if (data === "") {
      throw new Error("Signing empty data is not supported.");
    }

    const msg = new RequestSignAminoMsgFetchSigning(chainId, signer, signDoc, {
      isADR36WithString,
      ethSignType: type,
    });
    const signature = (await this.requester.sendMessage(BACKGROUND_PORT, msg))
      .signature;
    return Buffer.from(signature.signature, "base64");
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

  protected getDataForADR36(data: string | Uint8Array): [string, boolean] {
    let isADR36WithString = false;
    if (typeof data === "string") {
      data = Buffer.from(data).toString("base64");
      isADR36WithString = true;
    } else {
      data = Buffer.from(data).toString("base64");
    }
    return [data, isADR36WithString];
  }

  protected getADR36SignDoc(signer: string, data: string): StdSignDoc {
    return {
      chain_id: "",
      account_number: "0",
      sequence: "0",
      fee: {
        gas: "0",
        amount: [],
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer,
            data,
          },
        },
      ],
      memo: "",
    };
  }
}

export class FetchAddressBook implements AddressBookApi {
  constructor(protected readonly requester: MessageRequester) {}

  async listEntries(): Promise<AddressBookEntry[]> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new ListEntriesMsg()
    );
  }

  async addEntry(entry: AddressBookEntry): Promise<void> {
    await this.requester.sendMessage(BACKGROUND_PORT, new AddEntryMsg(entry));
  }

  async updateEntry(entry: AddressBookEntry): Promise<void> {
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UpdateEntryMsg(entry)
    );
  }

  async deleteEntry(address: string): Promise<void> {
    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new DeleteEntryMsg(address)
    );
  }
}

export class ExtensionCoreFetchWallet implements FetchBrowserWallet {
  readonly keplr: Keplr;
  readonly version: string;
  readonly wallet: WalletApi;

  constructor(keplr: Keplr, version: string, _requester: MessageRequester) {
    this.keplr = keplr;
    this.version = version;
    this.wallet = new FetchWalletApi(
      new FetchNetworks(_requester),
      new FetchAccount(_requester),
      new FetchSigning(_requester),
      new FetchAddressBook(_requester),
      _requester
    );
  }
}
