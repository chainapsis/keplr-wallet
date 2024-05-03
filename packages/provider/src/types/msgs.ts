import {
  Account,
  AddressBookEntry,
  NetworkConfig,
  WalletStatus,
} from "@fetchai/wallet-types";
import { Message } from "@keplr-wallet/router";
import {
  ChainInfo,
  EthSignType,
  KeplrSignOptions,
  Key,
  AminoSignResponse,
  StdSignature,
  StdSignDoc,
  ChainInfoWithoutEndpoints,
} from "@keplr-wallet/types";

export class EnableAccessMsg extends Message<void> {
  public static type() {
    return "enable-access";
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return "permission";
  }

  type(): string {
    return EnableAccessMsg.type();
  }
}

export class DisableAccessMsg extends Message<void> {
  public static type() {
    return "disable-access";
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainIds) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return "permission";
  }

  type(): string {
    return DisableAccessMsg.type();
  }
}

export class GetKeyMsg extends Message<Key> {
  public static type() {
    return "get-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return GetKeyMsg.type();
  }
}

export class SuggestChainInfoMsg extends Message<void> {
  public static type() {
    return "suggest-chain-info";
  }

  constructor(public readonly chainInfo: ChainInfo) {
    super();
  }

  validateBasic(): void {
    if (!this.chainInfo) {
      throw new Error("chain info not set");
    }
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return SuggestChainInfoMsg.type();
  }
}

export class SuggestTokenMsg extends Message<void> {
  public static type() {
    return "suggest-token";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string,
    public readonly viewingKey?: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new Error("Contract address is empty");
    }
  }

  route(): string {
    return "tokens";
  }

  type(): string {
    return SuggestTokenMsg.type();
  }
}

// Return the tx hash
export class SendTxMsg extends Message<Uint8Array> {
  public static type() {
    return "send-tx-to-background";
  }

  constructor(
    public readonly chainId: string,
    public readonly tx: unknown,
    public readonly mode: "async" | "sync" | "block"
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id is empty");
    }

    if (!this.tx) {
      throw new Error("tx is empty");
    }

    if (
      !this.mode ||
      (this.mode !== "sync" && this.mode !== "async" && this.mode !== "block")
    ) {
      throw new Error("invalid mode");
    }
  }

  route(): string {
    return "background-tx";
  }

  type(): string {
    return SendTxMsg.type();
  }
}

export class GetSecret20ViewingKey extends Message<string> {
  public static type() {
    return "get-secret20-viewing-key";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new Error("Contract address is empty");
    }
  }

  route(): string {
    return "tokens";
  }

  type(): string {
    return GetSecret20ViewingKey.type();
  }
}

export class RequestSignAminoMsg extends Message<AminoSignResponse> {
  public static type() {
    return "request-sign-amino";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: KeplrSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
      ethSignType?: EthSignType;
    } = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);

    const signDoc = this.signDoc;

    // Check that the sign doc is for ADR-36,
    // the validation should be performed on the background.
    const hasOnlyMsgSignData = (() => {
      if (
        signDoc &&
        signDoc.msgs &&
        Array.isArray(signDoc.msgs) &&
        signDoc.msgs.length === 1
      ) {
        const msg = signDoc.msgs[0];
        return msg.type === "sign/MsgSignData";
      } else {
        return false;
      }
    })();

    // If the sign doc is expected to be for ADR-36,
    // it doesn't have to have the chain id in the sign doc.
    if (!hasOnlyMsgSignData && signDoc.chain_id !== this.chainId) {
      throw new Error(
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new Error("Sign options are null");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestSignAminoMsg.type();
  }
}

export class RequestSignEIP712CosmosTxMsg_v0 extends Message<AminoSignResponse> {
  public static type() {
    return "request-sign-eip-712-cosmos-tx-v0";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: KeplrSignOptions
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    if (this.signDoc.chain_id !== this.chainId) {
      throw new Error(
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new Error("Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestSignEIP712CosmosTxMsg_v0.type();
  }
}

export class RequestICNSAdr36SignaturesMsg extends Message<
  {
    chainId: string;
    bech32Prefix: string;
    bech32Address: string;
    addressHash: "cosmos" | "ethereum";
    pubKey: Uint8Array;
    signatureSalt: number;
    signature: Uint8Array;
  }[]
> {
  public static type() {
    return "request-icns-adr-36-signatures";
  }

  constructor(
    readonly chainId: string,
    readonly contractAddress: string,
    readonly owner: string,
    readonly username: string,
    readonly addressChainIds: string[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.contractAddress) {
      throw new Error("contract address not set");
    }

    if (!this.owner) {
      throw new Error("signer not set");
    }

    // Validate bech32 address.
    // Bech32Address.validate(this.signer);

    if (!this.username) {
      throw new Error("username not set");
    }

    if (!this.addressChainIds || this.addressChainIds.length === 0) {
      throw new Error("address chain ids not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestICNSAdr36SignaturesMsg.type();
  }
}

export class RequestVerifyADR36AminoSignDoc extends Message<boolean> {
  public static type() {
    return "request-verify-adr-36-amino-doc";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: Uint8Array,
    public readonly signature: StdSignature
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    if (!this.signature) {
      throw new Error("Signature not set");
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestVerifyADR36AminoSignDoc.type();
  }
}

export class RequestSignDirectMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return "request-sign-direct";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: string | null;
    },
    public readonly signOptions: KeplrSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);

    // const signDoc = cosmos.tx.v1beta1.SignDoc.create({
    //   bodyBytes: this.signDoc.bodyBytes,
    //   authInfoBytes: this.signDoc.authInfoBytes,
    //   chainId: this.signDoc.chainId,
    //   accountNumber: this.signDoc.accountNumber
    //     ? Long.fromString(this.signDoc.accountNumber)
    //     : undefined,
    // });
    //
    // if (signDoc.chainId !== this.chainId) {
    //   throw new Error(
    //     "Chain id in the message is not matched with the requested chain id"
    //   );
    // }

    if (!this.signOptions) {
      throw new Error("Sign options are null");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestSignDirectMsg.type();
  }
}

export class GetPubkeyMsg extends Message<Uint8Array> {
  public static type() {
    return "get-pubkey-msg";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return "secret-wasm";
  }

  type(): string {
    return GetPubkeyMsg.type();
  }
}

export class ReqeustEncryptMsg extends Message<Uint8Array> {
  public static type() {
    return "request-encrypt-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    public readonly msg: object
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.contractCodeHash) {
      throw new Error("contract code hash not set");
    }

    if (!this.msg) {
      throw new Error("msg not set");
    }
  }

  route(): string {
    return "secret-wasm";
  }

  type(): string {
    return ReqeustEncryptMsg.type();
  }
}

export class RequestDecryptMsg extends Message<Uint8Array> {
  public static type() {
    return "request-decrypt-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly cipherText: Uint8Array,
    public readonly nonce: Uint8Array
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.cipherText || this.cipherText.length === 0) {
      throw new Error("ciphertext not set");
    }

    if (!this.nonce || this.nonce.length === 0) {
      throw new Error("nonce not set");
    }
  }

  route(): string {
    return "secret-wasm";
  }

  type(): string {
    return RequestDecryptMsg.type();
  }
}

export class GetTxEncryptionKeyMsg extends Message<Uint8Array> {
  public static type() {
    return "get-tx-encryption-key-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly nonce: Uint8Array
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.nonce) {
      // Nonce of zero length is permitted.
      throw new Error("nonce is null");
    }
  }

  route(): string {
    return "secret-wasm";
  }

  type(): string {
    return GetTxEncryptionKeyMsg.type();
  }
}

export class GetChainInfosWithoutEndpointsMsg extends Message<{
  chainInfos: ChainInfoWithoutEndpoints[];
}> {
  public static type() {
    return "get-chain-infos-without-endpoints";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return GetChainInfosWithoutEndpointsMsg.type();
  }
}

export class GetAnalyticsIdMsg extends Message<string> {
  public static type() {
    return "get-analytics-id";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return "analytics";
  }

  type(): string {
    return GetAnalyticsIdMsg.type();
  }
}

export class ChangeKeyRingNameMsg extends Message<string> {
  public static type() {
    return "change-keyring-name-msg";
  }

  constructor(
    public readonly defaultName: string,
    public readonly editable: boolean
  ) {
    super();
  }

  validateBasic(): void {
    // Not allow empty name.
    if (!this.defaultName) {
      throw new Error("default name not set");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return ChangeKeyRingNameMsg.type();
  }
}

export class StatusMsg extends Message<WalletStatus> {
  public static type() {
    return "status-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return StatusMsg.type();
  }
}

export class UnlockWalletMsg extends Message<void> {
  public static type() {
    return "unlock-wallet-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return UnlockWalletMsg.type();
  }
}

export class LockWalletMsg extends Message<void> {
  public static type() {
    return "lock-wallet-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return LockWalletMsg.type();
  }
}

export class RestoreWalletMsg extends Message<WalletStatus> {
  public static type() {
    return "restore-wallet";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RestoreWalletMsg.type();
  }
}

export class CurrentAccountMsg extends Message<Account> {
  public static type() {
    return "current-account-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    //noop
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return CurrentAccountMsg.type();
  }
}

export class SwitchAccountMsg extends Message<void> {
  public static type() {
    return "switch-account-msg";
  }

  constructor(public readonly address: string) {
    super();
  }

  validateBasic(): void {
    if (!this.address) {
      throw new Error("address is empty");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return SwitchAccountMsg.type();
  }
}

export class ListAccountsMsg extends Message<Account[]> {
  public static type() {
    return "list-account-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return ListAccountsMsg.type();
  }
}

export class GetAccountMsg extends Message<Account | null> {
  public static type() {
    return "get-account-msg";
  }

  constructor(public readonly address: string) {
    super();
  }

  validateBasic(): void {
    if (!this.address) {
      throw new Error("address is empty");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return GetAccountMsg.type();
  }
}

export class GetNetworkMsg extends Message<NetworkConfig> {
  public static type() {
    return "current-network-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    //noop
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return GetNetworkMsg.type();
  }
}

export class ListNetworksMsg extends Message<NetworkConfig[]> {
  public static type() {
    return "list-network-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return ListNetworksMsg.type();
  }
}

export class GetKeyMsgFetchSigning extends Message<Account> {
  public static type() {
    return "get-key-fetch-signing";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return GetKeyMsgFetchSigning.type();
  }
}

export class RequestSignAminoMsgFetchSigning extends Message<AminoSignResponse> {
  public static type() {
    return "request-sign-amino-fetch-signing";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: KeplrSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
      ethSignType?: EthSignType;
    } = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);

    const signDoc = this.signDoc;

    // Check that the sign doc is for ADR-36,
    // the validation should be performed on the background.
    const hasOnlyMsgSignData = (() => {
      if (
        signDoc &&
        signDoc.msgs &&
        Array.isArray(signDoc.msgs) &&
        signDoc.msgs.length === 1
      ) {
        const msg = signDoc.msgs[0];
        return msg.type === "sign/MsgSignData";
      } else {
        return false;
      }
    })();

    // If the sign doc is expected to be for ADR-36,
    // it doesn't have to have the chain id in the sign doc.
    if (!hasOnlyMsgSignData && signDoc.chain_id !== this.chainId) {
      throw new Error(
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new Error("Sign options are null");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestSignAminoMsgFetchSigning.type();
  }
}

export class RequestSignDirectMsgFetchSigning extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return "request-sign-direct-fetch-signing";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: string | null;
    },
    public readonly signOptions: KeplrSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);

    // const signDoc = cosmos.tx.v1beta1.SignDoc.create({
    //   bodyBytes: this.signDoc.bodyBytes,
    //   authInfoBytes: this.signDoc.authInfoBytes,
    //   chainId: this.signDoc.chainId,
    //   accountNumber: this.signDoc.accountNumber
    //     ? Long.fromString(this.signDoc.accountNumber)
    //     : undefined,
    // });
    //
    // if (signDoc.chainId !== this.chainId) {
    //   throw new Error(
    //     "Chain id in the message is not matched with the requested chain id"
    //   );
    // }

    if (!this.signOptions) {
      throw new Error("Sign options are null");
    }
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestSignDirectMsgFetchSigning.type();
  }
}

export class RequestVerifyADR36AminoSignDocFetchSigning extends Message<boolean> {
  public static type() {
    return "request-verify-adr-36-amino-doc-fetch-signing";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: Uint8Array,
    public readonly signature: StdSignature
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.signer) {
      throw new Error("signer not set");
    }

    if (!this.signature) {
      throw new Error("Signature not set");
    }

    // It is not important to check this on the client side as opposed to increasing the bundle size.
    // Validate bech32 address.
    // Bech32Address.validate(this.signer);
  }

  route(): string {
    return "keyring";
  }

  type(): string {
    return RequestVerifyADR36AminoSignDocFetchSigning.type();
  }
}

export class AddNetworkAndSwitchMsg extends Message<void> {
  public static type() {
    return "add-chain-by-network";
  }

  constructor(public readonly network: NetworkConfig) {
    super();
  }

  validateBasic(): void {
    if (!this.network) {
      throw new Error("chain info not set");
    }
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return AddNetworkAndSwitchMsg.type();
  }
}

export class SwitchNetworkByChainIdMsg extends Message<void> {
  public static type() {
    return "switch-network-by-chainid";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is empty");
    }
  }

  route(): string {
    return "chains";
  }

  type(): string {
    return SwitchNetworkByChainIdMsg.type();
  }
}

export class SubscribeOnStatusChangeMsg extends Message<void> {
  public static type() {
    return "subscribe-on-status-changed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnStatusChangeMsg.type();
  }
}

export class UnsubscribeOnStatusChangeMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-status-changed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnStatusChangeMsg.type();
  }
}

export class SubscribeOnNetworkChangeMsg extends Message<void> {
  public static type() {
    return "subscribe-on-network-changed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnNetworkChangeMsg.type();
  }
}

export class UnsubscribeOnNetworkChangeMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-network-changed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnNetworkChangeMsg.type();
  }
}

export class SubscribeOnAccountChangeMsg extends Message<void> {
  public static type() {
    return "subscribe-on-account-changed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnAccountChangeMsg.type();
  }
}

export class UnsubscribeOnAccountChangeMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-account-changed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnAccountChangeMsg.type();
  }
}

export class SubscribeOnTxFailedMsg extends Message<void> {
  public static type() {
    return "subscribe-on-tx-failed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnTxFailedMsg.type();
  }
}

export class UnsubscribeOnTxFailedMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-tx-failed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnTxFailedMsg.type();
  }
}

export class SubscribeOnTxSuccessfulMsg extends Message<void> {
  public static type() {
    return "subscribe-on-tx-successful";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnTxSuccessfulMsg.type();
  }
}

export class UnsubscribeOnTxSuccessfulMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-tx-successful";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnTxSuccessfulMsg.type();
  }
}

export class SubscribeOnEVMTxFailedMsg extends Message<void> {
  public static type() {
    return "subscribe-on-evm-tx-failed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnEVMTxFailedMsg.type();
  }
}

export class UnsubscribeOnEVMTxFailedMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-evm-tx-failed";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnEVMTxFailedMsg.type();
  }
}

export class SubscribeOnEVMTxSuccessfulMsg extends Message<void> {
  public static type() {
    return "subscribe-on-evm-tx-successful";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return SubscribeOnEVMTxSuccessfulMsg.type();
  }
}

export class UnsubscribeOnEVMTxSuccessfulMsg extends Message<void> {
  public static type() {
    return "unsubscribe-on-evm-tx-successful";
  }

  constructor(public readonly handler: any) {
    super();
  }

  validateBasic(): void {
    if (!this.handler) {
      throw new Error("handler is empty");
    }
  }

  route(): string {
    return "events";
  }

  type(): string {
    return UnsubscribeOnEVMTxSuccessfulMsg.type();
  }
}

export class ListEntriesMsg extends Message<AddressBookEntry[]> {
  public static type() {
    return "list-entries-msg";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "address-book";
  }

  type(): string {
    return ListEntriesMsg.type();
  }
}

export class AddEntryMsg extends Message<void> {
  public static type() {
    return "add-entry-msg";
  }

  constructor(public readonly entry: AddressBookEntry) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "address-book";
  }

  type(): string {
    return AddEntryMsg.type();
  }
}

export class UpdateEntryMsg extends Message<void> {
  public static type() {
    return "update-entry-msg";
  }

  constructor(public readonly entry: AddressBookEntry) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "address-book";
  }

  type(): string {
    return UpdateEntryMsg.type();
  }
}
export class DeleteEntryMsg extends Message<void> {
  public static type() {
    return "delete-entry-msg";
  }

  constructor(public readonly address: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return "address-book";
  }

  type(): string {
    return DeleteEntryMsg.type();
  }
}
