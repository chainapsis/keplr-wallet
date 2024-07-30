import { KeplrError, Message } from "@keplr-wallet/router";
import { ChainInfo, ChainInfoWithoutEndpoints } from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import { ChainInfoWithCoreTypes } from "./types";

export class PingMsg extends Message<void> {
  public static type() {
    return "keplr-ping";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  override approveExternal(): boolean {
    return true;
  }

  type(): string {
    return PingMsg.type();
  }
}

export class GetChainInfosWithCoreTypesMsg extends Message<{
  chainInfos: ChainInfoWithCoreTypes[];
}> {
  public static type() {
    return "get-chain-infos-with-core-types";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainInfosWithCoreTypesMsg.type();
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

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainInfosWithoutEndpointsMsg.type();
  }
}

export class GetChainInfoWithoutEndpointsMsg extends Message<{
  chainInfo: ChainInfoWithoutEndpoints | undefined;
}> {
  public static type() {
    return "get-chain-info-without-endpoints";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("chains", 101, "Chain id not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainInfoWithoutEndpointsMsg.type();
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
      throw new KeplrError("chains", 100, "Chain info not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SuggestChainInfoMsg.type();
  }
}

export class RemoveSuggestedChainInfoMsg extends Message<
  ChainInfoWithCoreTypes[]
> {
  public static type() {
    return "remove-suggested-chain-info";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new KeplrError("chains", 101, "Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveSuggestedChainInfoMsg.type();
  }
}

export class SetChainEndpointsMsg extends Message<ChainInfoWithCoreTypes[]> {
  public static type() {
    return "set-chain-endpoints";
  }

  constructor(
    public readonly chainId: string,
    public readonly rpc: string | undefined,
    public readonly rest: string | undefined,
    public readonly evmRpc: string | undefined
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Empty chain id");
    }

    if (this.rpc) {
      // Make sure that rpc is valid url form
      const url = new URL(this.rpc);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`RPC has invalid protocol: ${url.protocol}`);
      }
    }
    if (this.rest) {
      // Make sure that rest is valid url form
      const url = new URL(this.rest);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`LCD has invalid protocol: ${url.protocol}`);
      }
    }
    if (this.evmRpc) {
      // Make sure that evm rpc is valid url form
      const url = new URL(this.evmRpc);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`EVM RPC has invalid protocol: ${url.protocol}`);
      }
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetChainEndpointsMsg.type();
  }
}

export class ClearChainEndpointsMsg extends Message<ChainInfoWithCoreTypes[]> {
  public static type() {
    return "clear-chain-endpoints";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Empty chain id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ClearChainEndpointsMsg.type();
  }
}

export class GetChainOriginalEndpointsMsg extends Message<{
  rpc: string;
  rest: string;
}> {
  public static type() {
    return "get-chain-original-endpoints";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Empty chain id");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainOriginalEndpointsMsg.type();
  }
}

export class ClearAllSuggestedChainInfosMsg extends Message<void> {
  public static type() {
    return "clear-all-suggested-chain-infos";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    //noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ClearAllSuggestedChainInfosMsg.type();
  }
}

export class ClearAllChainEndpointsMsg extends Message<void> {
  public static type() {
    return "clear-all-chain-endpoints";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    //noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ClearAllChainEndpointsMsg.type();
  }
}
