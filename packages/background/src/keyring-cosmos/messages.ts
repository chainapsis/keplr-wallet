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
} from "@keplr-wallet/cosmos";

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
