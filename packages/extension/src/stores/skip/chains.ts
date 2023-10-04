import {
  ChainGetter,
  IChainInfoImpl,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { ChainsResponse } from "./types";
import { computed, makeObservable } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { computedFn } from "mobx-utils";
import Joi from "joi";

const Schema = Joi.object<ChainsResponse>({
  chains: Joi.array().items(
    Joi.object({
      chain_id: Joi.string(),
      pfm_enabled: Joi.boolean(),
      supports_memo: Joi.boolean(),
    }).unknown(true)
  ),
}).unknown(true);

export class ObservableQueryChains extends ObservableQuery<ChainsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly skipURL: string
  ) {
    super(sharedContext, skipURL, "/v1/info/chains");

    makeObservable(this);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: ChainsResponse }> {
    const res = await super.fetchResponse(abortController);

    const validated = Schema.validate(res.data);
    if (validated.error) {
      console.log("Failed to validate chains response", validated.error);
      throw validated.error;
    }

    return {
      headers: res.headers,
      data: validated.value,
    };
  }

  @computed
  get chains(): {
    chainInfo: IChainInfoImpl;
    pfmEnabled: boolean;
    supportsMemo: boolean;
  }[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.chains
      .filter((chain) => {
        return this.chainGetter.hasChain(chain.chain_id);
      })
      .map((chain) => {
        return {
          chainInfo: this.chainGetter.getChain(chain.chain_id),
          pfmEnabled: chain.pfm_enabled,
          supportsMemo: chain.supports_memo ?? false,
        };
      });
  }

  isPFMEnabled = computedFn((chainId: string): boolean => {
    const chain = this.chains.find((chain) => {
      return (
        chain.chainInfo.chainIdentifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });
    if (!chain) {
      return false;
    }

    return chain.pfmEnabled;
  });

  isSupportsMemo = computedFn((chainId: string): boolean => {
    const chain = this.chains.find((chain) => {
      return (
        chain.chainInfo.chainIdentifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });
    if (!chain) {
      return false;
    }

    return chain.supportsMemo;
  });
}
