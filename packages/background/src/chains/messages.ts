import { Message } from "@keplr-wallet/router";
import { ChainInfoWithCoreTypes } from "./types";
import { ChainInfo, ChainInfoWithoutEndpoints } from "@keplr-wallet/types";
import { ROUTE } from "./constants";
import { NetworkConfig } from "@fetchai/wallet-types";

export class GetChainInfosMsg extends Message<{
  chainInfos: ChainInfoWithCoreTypes[];
}> {
  public static type() {
    return "get-chain-infos";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainInfosMsg.type();
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

export class SuggestChainInfoMsg extends Message<void> {
  public static type() {
    return "suggest-chain-info";
  }

  constructor(public readonly chainInfo: ChainInfo) {
    super();
  }

  validateBasic(): void {
    if (!this.chainInfo) {
      throw new Error("Chain info not set");
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
      throw new Error("Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveSuggestedChainInfoMsg.type();
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
    //  noop
  }

  route(): string {
    return ROUTE;
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
    return ROUTE;
  }

  type(): string {
    return ListNetworksMsg.type();
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
    return ROUTE;
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
      throw new Error("network is empty");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SwitchNetworkByChainIdMsg.type();
  }
}

export class SetSelectedChainMsg extends Message<void> {
  public static type() {
    return "set-selected-chain";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new Error("Chain info not set");
    }
  }

  override approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetSelectedChainMsg.type();
  }
}
