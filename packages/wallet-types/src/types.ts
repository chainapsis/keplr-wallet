import {
  Keplr,
  KeplrSignOptions,
  OfflineDirectSigner,
  OfflineAminoSigner,
  AminoSignResponse,
  StdSignDoc,
  DirectSignResponse,
  StdSignature,
  EthSignType,
} from "@keplr-wallet/types";
import { PublicKey } from "./public-keys";
import { NetworkConfig } from "./network-info";

export enum WalletStatus {
  NOTLOADED,
  EMPTY,
  LOCKED,
  UNLOCKED,
}

/**
 * The representation of the Account
 */
export interface Account {
  /**
   * The address of the account
   */
  readonly address: Uint8Array;

  /**
   * The public key of the account
   */
  readonly pubKey: Uint8Array;

  /**
   * The name of the account
   */
  readonly name: string;

  /**
   * The algo used for the account
   */
  readonly algo: string;

  /**
   * The bech32Address of the account
   */
  readonly bech32Address: string;

  /**
   * The Hex Address of the account
   */
  readonly EVMAddress: string;

  /**
   * Is Nano Ledger account
   */
  readonly isNanoLedger: boolean;

  /**
   * Is Keystone account
   */
  readonly isKeystone: boolean;
}

/**
 * A representation of a Signature
 */
export interface Signature {
  /**
   * The message data that was signed
   */
  readonly messageData: Uint8Array;

  /**
   * The public key that was used to sign  the message
   */
  readonly publicKey: PublicKey;

  /**
   * The signature that was generated from the signing process
   */
  readonly signature: Uint8Array;
}

/**
 * The Networks API allows users to control which network the Fetch Wallet
 */
export interface NetworksApi {
  /**
   * The current network that the Fetch Wallet is targeting
   *
   * @throws An error if the wallet is locked or if the dApp does not have permission to the networks API
   */
  getNetwork(): Promise<NetworkConfig>;

  /**
   * Switch a specified network
   *
   * @param network The new network to target the Wallet at.
   * @throws An error if the dApp does not have permission to the networks API
   */
  switchToNetwork(network: NetworkConfig): Promise<void>;

  /**
   * Switch to a previous network by chain id
   *
   * @param chainId The chain id of the new network to target
   * @throws An error if the dApp does not have permission to the networks API
   */
  switchToNetworkByChainId(chainId: string): Promise<void>;

  /**
   * List all the currently known networks in the wallet
   *
   * @throws An error if the dApp does not have permission to the networks API
   */
  listNetworks(): Promise<NetworkConfig[]>;
}

/**
 * The accounts API controls access to the private / public key pairs which are controlled by the browser wallet.
 */
export interface AccountsApi {
  /**
   * Get the currently selected account in the wallet
   *
   * @return the currently selected account
   * @throws An error if the wallet is locked or the dApp does not have permission to access the Accounts API
   */
  currentAccount(): Promise<Account>;

  /**
   * Change the current active account to the address specified
   *
   * @param address The address to switch to
   * @throws An error if the wallet is locked or the dApp does not have permission to access the Accounts API
   */
  switchAccount(address: string): Promise<void>;

  /**
   * Allows the user to be list the available accounts for the selected network
   *
   * @returns The list of accounts
   * @throws An error if the wallet is locked or the dApp does not have permission to access the Accounts API
   */
  listAccounts(): Promise<Account[]>;

  /**
   * Allows the user to look up a specific account
   *
   * @param address The address of the account to lookup
   * @returns The account object on a successful lookup
   * @throws An error if the account can't be found, the wallet is locked or the dApp does not have permission to access
   * the Accounts API
   */
  getAccount(address: string): Promise<Account | null>;
}

/**
 * The API definition of an address book entry
 */
export interface AddressBookEntry {
  /**
   * The wallet address.
   *
   * The representation is chain specific. For example in the case of the Fetch chain it should be bech32 encoded and
   * should have the prefix `fetch`
   */
  address: string;

  /**
   * The human-readable name associated with the address
   */
  name: string;

  /**
   * A set of chain IDs to which this address book entry is applicable
   */
  // chainIds: string[];

  /**
   * The human-readable memo associated with the address
   */
  memo: string;
}

/**
 * The address book API is a feature that the user can optionally allow dApps access to.
 */
export interface AddressBookApi {
  /**
   * Get all the address book entries
   *
   * @returns The list of address book entries that are stored in the wallet
   *
   * @throws An error if the wallet is locked or if dApp does not have permission to access the address book
   */
  listEntries(): Promise<AddressBookEntry[]>;

  /**
   * Adds an address book entry to the wallet
   *
   * @param entry The entry to be added
   *
   * @throws An error if hte entry address already exists in the address book, or if the dApp does not have permission
   * to access the address book
   */
  addEntry(entry: AddressBookEntry): Promise<void>;

  /**
   * Updates an existing address book entry to the wallet
   *
   * @param entry The entry to be updated
   *
   * @throws An error if the existing entry can not be found in the address book, or if the dApp does not have permission
   * to access the address book
   */
  updateEntry(entry: AddressBookEntry): Promise<void>;

  /**
   * Deletes a specified address from the address book
   *
   * @param address The address to be removed from the wallet
   *
   * @throws An error if the address does not match an entry in the address book, or if the dApp does not have permission
   * to access the address book
   */
  deleteEntry(address: string): Promise<void>;
}

/**
 * The signing API is used be dApp developers to be able to sign transactions and other interactions with the network
 *
 * By design, we expect most users to build and sign transactions by using CosmJS. By comparison with the original
 * Keplr we do not allow other signing messages
 */
export interface SigningApi {
  getCurrentKey(chainId: string): Promise<Account>;

  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse>;

  signEthereum(
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array>;

  signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      /** SignDoc bodyBytes */
      bodyBytes?: Uint8Array | null;
      /** SignDoc authInfoBytes */
      authInfoBytes?: Uint8Array | null;
      /** SignDoc chainId */
      chainId?: string | null;
      /** SignDoc accountNumber */
      accountNumber?: Long | null;
    },
    signOptions?: KeplrSignOptions
  ): Promise<DirectSignResponse>;

  /**
   * Signs arbitrary data
   *
   * This API can be very useful when authenticating users by their wallet address
   *
   * @param chainId The target chain id
   * @param signer The target signer
   * @param data The data that should have been signed
   * @returns A signature object that can be verified
   */
  signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature>;

  /**
   * Verifies a signature made via the `signArbitrary` API
   *
   * @param chainId The target chain id
   * @param signer The target signer
   * @param data The data that should have been signed
   * @param signature The signature to verify
   * @returns True if the signature is verified, otherwise false.
   */
  verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean>;

  /**
   * Get a signer capable of either Direct or Amino signing methods.
   *
   * In the case that the underlying signer can support both, the direct signer will be used by default (since it is
   * newer).
   *
   * @param chainId The targeted chain id
   * @returns An CosmJS compatible signer
   */
  getOfflineSigner(
    chainId: string
  ): Promise<OfflineDirectSigner | OfflineAminoSigner>;

  /**
   * Get a signer that supports Direct only signing methods
   *
   * @param chainId The target chain id
   * @returns A CosmJS compatible signer
   */
  getOfflineDirectSigner(chainId: string): Promise<OfflineDirectSigner>;

  /**
   * Get a signer that supports Amino only signing methods.
   *
   * @param chainId The target chain id
   * @returns A CosmJS compatible signer
   */
  getOfflineAminoSigner(chainId: string): Promise<OfflineAminoSigner>;

  // TODO(EJF): Need to add methods for BLS aggregated signatures
}

/**
 * The WalletAPI
 *
 * The main goal of the wallet api is to provide a good interface for dApp builders in order to build compelling
 * interfaces.
 *
 * The interface is designed to be extended over time.
 */
export interface WalletApi {
  /**
   * Determine the status of the wallet. It is either locked or unlocked
   */
  status(): Promise<WalletStatus>;

  /**
   * Allows the user to restore the wallet from the UI in case the wallet keyring is not loaded
   */
  restoreWallet(): Promise<WalletStatus>;

  /**
   * Allows the user to lock the wallet from the UI. This can implement logout like functionality
   */
  lockWallet(): Promise<void>;

  /**
   * Allows the dApp to
   */
  unlockWallet(): Promise<void>;

  /**
   * Allows the user to grant global permissions for selected chain ids to the origin (dApp)
   */
  enable(chainIds: string | string[]): Promise<void>;

  /**
   * Delete permissions granted to origin.
   * If chain ids are specified, only the permissions granted to each chain id are deleted (In this case, permissions such as listNetworks() are not deleted).
   * Else, remove all permissions granted to origin (In this case, permissions that are not assigned to each chain, such as listNetworks(), are also deleted).
   */
  disable(chainIds?: string | string[]): Promise<void>;
  /**
   * The networks API
   */
  networks: NetworksApi;

  /**
   * The accounts API
   */
  accounts: AccountsApi;

  /**
   * The address book API
   */
  addressBook: AddressBookApi;

  /**
   * The signing API
   */
  signing: SigningApi;
}

/**
 * The main browser wallet extension API
 *
 * Typically, injected into window.fetchBrowserWallet
 */
export interface FetchBrowserWallet {
  /**
   * The version of the installed browser wallet extension
   */
  readonly version: string;

  /**
   * The main Wallet API
   *
   * Allows users to interact with the Fetch Network
   */
  readonly wallet: WalletApi;

  /**
   * @deprecated Legacy Keplr API
   */
  readonly keplr: Keplr;
}
