import { KeplrError, Message } from "@keplr-wallet/router";
import {
  AminoSignResponse,
  KeplrSignOptions,
  Key,
  SettledResponses,
  StdSignature,
  StdSignDoc,
} from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
  EthermintChainIdHelper,
} from "@keplr-wallet/cosmos";
import {
  SignDoc,
  SignDocDirectAux,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { Int } from "@keplr-wallet/unit";
import bigInteger from "big-integer";

export class GetCosmosKeyMsg extends Message<Key> {
  public static type() {
    return "get-cosmos-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCosmosKeyMsg.type();
  }
}

export class GetCosmosKeysSettledMsg extends Message<SettledResponses<Key>> {
  public static type() {
    return "get-cosmos-keys-settled";
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new Error("chainIds are not set");
    }

    const seen = new Map<string, boolean>();

    for (const chainId of this.chainIds) {
      if (seen.get(chainId)) {
        throw new Error(`chainId ${chainId} is duplicated`);
      }

      seen.set(chainId, true);
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCosmosKeysSettledMsg.type();
  }
}

export class RequestCosmosSignAminoMsg extends Message<AminoSignResponse> {
  public static type() {
    return "request-cosmos-sign-amino";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: KeplrSignOptions
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new KeplrError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      if (this.signDoc.msgs[0].value.signer !== this.signer) {
        throw new KeplrError("keyring", 233, "Unmatched signer in sign doc");
      }
    }

    if (!this.signOptions) {
      throw new KeplrError("keyring", 235, "Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestCosmosSignAminoMsg.type();
  }
}

export class RequestCosmosSignDirectMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return "request-cosmos-sign-direct";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array;
      authInfoBytes?: Uint8Array;
      chainId?: string;
      accountNumber?: string;
    },
    public readonly signOptions: KeplrSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    const signDoc = SignDoc.fromPartial({
      bodyBytes: this.signDoc.bodyBytes,
      authInfoBytes: this.signDoc.authInfoBytes,
      chainId: this.signDoc.chainId,
      accountNumber: this.signDoc.accountNumber,
    });

    if (signDoc.chainId !== this.chainId) {
      throw new KeplrError(
        "keyring",
        234,
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new KeplrError("keyring", 235, "Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestCosmosSignDirectMsg.type();
  }
}

export class RequestCosmosSignDirectAuxMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    publicKey:
      | {
          typeUrl: string;
          value: Uint8Array;
        }
      | undefined;
    chainId: string;
    accountNumber: string;
    sequence: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return "request-cosmos-sign-direct-aux";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes: Uint8Array;
      publicKey:
        | {
            typeUrl: string;
            value: Uint8Array;
          }
        | undefined;
      chainId: string;
      accountNumber: string;
      sequence: string;
    },
    public readonly signOptions: Exclude<
      KeplrSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    > = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    const signDoc = SignDocDirectAux.fromPartial({
      bodyBytes: this.signDoc.bodyBytes,
      publicKey: this.signDoc.publicKey,
      chainId: this.signDoc.chainId,
      accountNumber: this.signDoc.accountNumber,
      sequence: this.signDoc.sequence,
    });

    if (signDoc.chainId !== this.chainId) {
      throw new KeplrError(
        "keyring",
        234,
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new KeplrError("keyring", 235, "Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestCosmosSignDirectAuxMsg.type();
  }
}

export class PrivilegeCosmosSignAminoWithdrawRewardsMsg extends Message<AminoSignResponse> {
  public static type() {
    return "PrivilegeCosmosSignAminoWithdrawRewards";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new KeplrError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      throw new Error("Can't use ADR-36 sign doc");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PrivilegeCosmosSignAminoWithdrawRewardsMsg.type();
  }
}

export class PrivilegeCosmosSignAminoDelegateMsg extends Message<AminoSignResponse> {
  public static type() {
    return "PrivilegeCosmosSignAminoDelegate";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new KeplrError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      throw new Error("Can't use ADR-36 sign doc");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PrivilegeCosmosSignAminoDelegateMsg.type();
  }
}

export class PrivilegeCosmosSignAminoExecuteCosmWasmMsg extends Message<AminoSignResponse> {
  public static type() {
    return "PrivilegeCosmosSignAminoExecuteCosmWasm";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new KeplrError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      throw new Error("Can't use ADR-36 sign doc");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PrivilegeCosmosSignAminoExecuteCosmWasmMsg.type();
  }
}

export class RequestCosmosSignAminoADR36Msg extends Message<StdSignature> {
  public static type() {
    return "request-cosmos-sign-amino-adr-36";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: Uint8Array,
    public readonly signOptions: {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
    }
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    if (!this.signOptions) {
      throw new KeplrError("keyring", 235, "Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestCosmosSignAminoADR36Msg.type();
  }
}

export class VerifyCosmosSignAminoADR36Msg extends Message<boolean> {
  public static type() {
    return "verify-cosmos-sign-amino-adr-36";
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
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    if (!this.signature) {
      throw new KeplrError("keyring", 271, "Signature not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return VerifyCosmosSignAminoADR36Msg.type();
  }
}

export class ComputeNotFinalizedKeyAddressesMsg extends Message<
  {
    coinType: number;
    bech32Address: string;
  }[]
> {
  public static type() {
    return "compute-not-finalized-key-addresses";
  }

  constructor(public readonly id: string, public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.id) {
      throw new Error("id not set");
    }

    if (!this.chainId) {
      throw new Error("chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ComputeNotFinalizedKeyAddressesMsg.type();
  }
}

export class GetCosmosKeysForEachVaultSettledMsg extends Message<
  SettledResponses<
    Key & {
      vaultId: string;
    }
  >
> {
  public static type() {
    return "GetCosmosKeysForEachVaultSettledMsg";
  }

  constructor(
    public readonly chainId: string,
    public readonly vaultIds: string[]
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.vaultIds || this.vaultIds.length === 0) {
      throw new Error("vaultIds are not set");
    }

    const seen = new Map<string, boolean>();

    for (const vaultId of this.vaultIds) {
      if (seen.get(vaultId)) {
        throw new Error(`vaultId ${vaultId} is duplicated`);
      }

      seen.set(vaultId, true);
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCosmosKeysForEachVaultSettledMsg.type();
  }
}

export class GetCosmosKeysForEachVaultWithSearchSettledMsg extends Message<
  SettledResponses<
    Key & {
      vaultId: string;
    }
  >
> {
  public static type() {
    return "GetCosmosKeysForEachVaultWithSearchSettledMsg";
  }

  constructor(
    public readonly chainId: string,
    public readonly vaultIds: string[],
    public readonly searchText: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chain id not set");
    }

    if (!this.vaultIds || this.vaultIds.length === 0) {
      throw new Error("vaultIds are not set");
    }

    const seen = new Map<string, boolean>();

    for (const vaultId of this.vaultIds) {
      if (seen.get(vaultId)) {
        throw new Error(`vaultId ${vaultId} is duplicated`);
      }

      seen.set(vaultId, true);
    }

    if (this.searchText == null) {
      throw new Error("searchText not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetCosmosKeysForEachVaultWithSearchSettledMsg.type();
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
      throw new KeplrError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new KeplrError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new KeplrError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }

      const { ethChainId } = EthermintChainIdHelper.parse(this.chainId);

      const ethChainIdInMsg: Int = (() => {
        const value = this.eip712.domain["chainId"];
        if (typeof value === "string" && value.startsWith("0x")) {
          return new Int(bigInteger(value.replace("0x", ""), 16).toString());
        }
        return new Int(value);
      })();
      if (!ethChainIdInMsg.equals(new Int(ethChainId))) {
        throw new Error(
          `Unmatched chain id for eth (expected: ${ethChainId}, actual: ${this.eip712.domain["chainId"]})`
        );
      }
    } else {
      throw new Error("Can't sign ADR-36 with EIP-712");
    }

    if (!this.signOptions) {
      throw new KeplrError("keyring", 235, "Sign options are null");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
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
    return "request-icns-adr-36-signatures-v2";
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

    // Validate bech32 address.
    Bech32Address.validate(this.contractAddress);

    if (!this.owner) {
      throw new Error("signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.owner);

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
    return ROUTE;
  }

  type(): string {
    return RequestICNSAdr36SignaturesMsg.type();
  }
}

export class EnableVaultsWithCosmosAddressMsg extends Message<
  {
    vaultId: string;
    newEnabledChains: ReadonlyArray<string>;
  }[]
> {
  public static type() {
    return "EnableVaultsWithCosmosAddressMsg";
  }

  constructor(
    public readonly chainId: string,
    public readonly bech32Address: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("chainId is not set");
    }

    if (!this.bech32Address) {
      throw new Error("bech32Address is not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return EnableVaultsWithCosmosAddressMsg.type();
  }
}
