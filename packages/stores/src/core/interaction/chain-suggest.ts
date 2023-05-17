import { InteractionStore } from "./interaction";
import { ChainInfo } from "@keplr-wallet/types";
import {
  ChainInfoWithRepoUpdateOptions,
  SuggestChainInfoMsg,
} from "@keplr-wallet/background";
import { flow, makeObservable, observable } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import Axios from "axios";
import { toGenerator } from "@keplr-wallet/common";

export class ChainSuggestStore {
  @observable
  protected _isLoading: boolean = false;

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
    }
  ) {
    makeObservable(this);
  }

  get waitingSuggestedChainInfo() {
    const datas = this.interactionStore.getDatas<{
      chainInfo: ChainInfo;
      origin: string;
    }>(SuggestChainInfoMsg.type());

    if (datas.length > 0) {
      return datas[0];
    }
  }

  get communityChainInfoRepoUrl(): string {
    return `https://github.com/${this.communityChainInfoRepo.organizationName}/${this.communityChainInfoRepo.repoName}`;
  }

  getCommunityChainInfoUrl(chainId: string): string {
    const chainIdHelper = ChainIdHelper.parse(chainId);
    return `${this.communityChainInfoRepoUrl}/blob/${this.communityChainInfoRepo.branchName}/cosmos/${chainIdHelper.identifier}.json`;
  }

  getCommunityChainInfo(
    chainId: string
  ): {
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
      const response = yield* toGenerator(
        Axios.get<ChainInfo>(`/cosmos/${chainIdentifier}.json`, {
          baseURL: `https://raw.githubusercontent.com/${this.communityChainInfoRepo.organizationName}/${this.communityChainInfoRepo.repoName}/${this.communityChainInfoRepo.branchName}`,
        })
      );

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
        chainInfo: response.data,
      });
    } catch (e) {
      console.log(e);
      this.communityChainInfo.set(chainIdentifier, {
        isLoading: false,
        chainInfo: undefined,
      });
    }
  }

  @flow
  *approve(chainInfo: ChainInfoWithRepoUpdateOptions) {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedChainInfo;

      if (data) {
        yield this.interactionStore.approve(data.type, data.id, chainInfo);
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *reject() {
    this._isLoading = true;

    try {
      const data = this.waitingSuggestedChainInfo;
      if (data) {
        yield this.interactionStore.reject(data.type, data.id);
      }
    } finally {
      this._isLoading = false;
    }
  }

  @flow
  *rejectAll() {
    this._isLoading = true;
    try {
      yield this.interactionStore.rejectAll(SuggestChainInfoMsg.type());
    } finally {
      this._isLoading = false;
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
