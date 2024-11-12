import { InteractionStore } from "./interaction";
import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoWithSuggestedOptions,
  SuggestChainInfoMsg,
} from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { toGenerator } from "@keplr-wallet/common";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

export class ChainSuggestStore {
  @observable.shallow
  protected communityChainInfo: Map<
    string,
    {
      chainInfo: ChainInfo | undefined;
      isLoading: boolean;
    }
  > = new Map();

  constructor(
    protected readonly interactionStore: InteractionStore,
    protected readonly communityChainInfoRepo: {
      readonly organizationName: string;
      readonly repoName: string;
      readonly branchName: string;
      readonly alternativeURL?: string;
    }
  ) {
    makeObservable(this);
  }

  get waitingSuggestedChainInfo() {
    const data = this.interactionStore.getAllData<{
      chainInfo: ChainInfo;
      origin: string;
    }>(SuggestChainInfoMsg.type());

    if (data.length > 0) {
      return data[0];
    }
  }

  get waitingSuggestedChainInfos() {
    return this.interactionStore.getAllData<{
      chainInfo: ChainInfo;
      origin: string;
    }>(SuggestChainInfoMsg.type());
  }

  get communityChainInfoRepoUrl(): string {
    return `https://github.com/${this.communityChainInfoRepo.organizationName}/${this.communityChainInfoRepo.repoName}`;
  }

  getCommunityChainInfoUrl(chainId: string): string {
    const isEvmOnlyChain = chainId.startsWith("eip155:");
    const chainIdHelper = ChainIdHelper.parse(chainId);
    return `${this.communityChainInfoRepoUrl}/blob/${
      this.communityChainInfoRepo.branchName
    }/${isEvmOnlyChain ? "evm" : "cosmos"}/${chainIdHelper.identifier}.json`;
  }

  getCommunityChainInfo(chainId: string): {
    chainInfo: ChainInfo | undefined;
    isLoading: boolean;
  } {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    if (!this.communityChainInfo.has(chainIdentifier)) {
      this.fetchCommunityChainInfo(chainId);
    }

    return this.communityChainInfo.get(chainIdentifier)!;
  }

  @flow
  protected *fetchCommunityChainInfo(chainId: string) {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const communityChainInfo = this.communityChainInfo.get(chainIdentifier);
    if (communityChainInfo) {
      return;
    }

    this.communityChainInfo.set(chainIdentifier, {
      isLoading: true,
      chainInfo: undefined,
    });

    try {
      const isEvmOnlyChain = chainId.startsWith("eip155:");
      const response = yield* toGenerator(
        simpleFetch<
          (Omit<ChainInfo, "rest"> & { websocket: string }) | ChainInfo
        >(
          this.communityChainInfoRepo.alternativeURL
            ? this.communityChainInfoRepo.alternativeURL
                .replace("{chain_identifier}", chainIdentifier)
                .replace("/cosmos/", isEvmOnlyChain ? "/evm/" : "/cosmos/")
            : `https://raw.githubusercontent.com/${
                this.communityChainInfoRepo.organizationName
              }/${this.communityChainInfoRepo.repoName}/${
                this.communityChainInfoRepo.branchName
              }/${isEvmOnlyChain ? "evm" : "cosmos"}/${chainIdentifier}.json`
        )
      );
      const chainInfo: ChainInfo =
        "rest" in response.data && !isEvmOnlyChain
          ? response.data
          : {
              ...response.data,
              rest: response.data.rpc,
              evm: {
                chainId: parseInt(
                  response.data.chainId.replace("eip155:", ""),
                  10
                ),
                rpc: response.data.rpc,
                ...("websocket" in response.data && {
                  websocket: response.data.websocket,
                }),
              },
              features: ["eth-address-gen", "eth-key-sign"].concat(
                response.data.features ?? []
              ),
            };

      if (
        ChainIdHelper.parse(response.data.chainId).identifier !==
        chainIdentifier
      ) {
        throw new Error(
          `Invalid chain identifier: (expected: ${chainIdentifier}, actual: ${
            ChainIdHelper.parse(response.data.chainId).identifier
          })`
        );
      }

      this.communityChainInfo.set(chainIdentifier, {
        isLoading: false,
        chainInfo,
      });
    } catch (e) {
      console.log(e);
      this.communityChainInfo.set(chainIdentifier, {
        isLoading: false,
        chainInfo: undefined,
      });
    }
  }

  async approveWithProceedNext(
    ids: string | string[],
    chainInfo: ChainInfoWithSuggestedOptions,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.approveWithProceedNextV2(
      ids,
      chainInfo,
      afterFn
    );
  }

  async rejectWithProceedNext(
    id: string,
    afterFn: (proceedNext: boolean) => void | Promise<void>
  ) {
    await this.interactionStore.rejectWithProceedNext(id, afterFn);
  }

  async rejectAll() {
    await this.interactionStore.rejectAll(SuggestChainInfoMsg.type());
  }

  isObsoleteInteraction(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteraction(id);
  }

  isObsoleteInteractionApproved(id: string | undefined): boolean {
    return this.interactionStore.isObsoleteInteractionApproved(id);
  }
}
