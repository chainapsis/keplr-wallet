import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";
import { ChainsResponse } from "./types";
import { computed, makeObservable } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { computedFn } from "mobx-utils";
import Joi from "joi";
import { InternalChainStore } from "../internal";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { ModularChainInfo } from "@keplr-wallet/types";

const Schema = Joi.object<ChainsResponse>({
  chains: Joi.array().items(
    Joi.object({
      chain_id: Joi.string(),
      pfm_enabled: Joi.boolean(),
      supports_memo: Joi.boolean(),
      chain_type: Joi.string(),
    }).unknown(true)
  ),
}).unknown(true);

export class ObservableQueryChains extends ObservableQuery<ChainsResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: InternalChainStore,
    protected readonly skipURL: string
  ) {
    super(sharedContext, skipURL, "/v1/swap/chains");

    makeObservable(this);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: ChainsResponse }> {
    const _result = await simpleFetch(this.baseURL, this.url, {
      signal: abortController.signal,
      headers: {
        ...(() => {
          const res: { authorization?: string } = {};
          if (process.env["SKIP_API_KEY"]) {
            res.authorization = process.env["SKIP_API_KEY"];
          }

          return res;
        })(),
      },
    });
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = Schema.validate(result.data);
    if (validated.error) {
      console.log("Failed to validate chains response", validated.error);
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  @computed
  get chains(): {
    chainInfo: ModularChainInfo;
    pfmEnabled: boolean;
    supportsMemo: boolean;
    chainType: string;
  }[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.chains
      .filter((chain) => {
        const isEVMChain = chain.chain_type === "evm";
        const chainId = isEVMChain
          ? `eip155:${chain.chain_id}`
          : chain.chain_id;

        return this.chainStore.hasModularChain(chainId);
      })
      .filter((chain) => {
        const isEVMChain = chain.chain_type === "evm";
        const chainId = isEVMChain
          ? `eip155:${chain.chain_id}`
          : chain.chain_id;

        return this.chainStore.isInModularChainInfosInListUI(chainId);
      })
      .map((chain) => {
        const isEVMChain = chain.chain_type === "evm";
        const chainId = isEVMChain
          ? `eip155:${chain.chain_id}`
          : chain.chain_id;

        return {
          chainInfo: this.chainStore.getModularChain(chainId),
          pfmEnabled: chain.pfm_enabled,
          supportsMemo: chain.supports_memo ?? false,
          chainType: chain.chain_type,
        };
      });
  }

  isPFMEnabled = computedFn((chainId: string): boolean => {
    const chain = this.chains.find((chain) => {
      return (
        ChainIdHelper.parse(chain.chainInfo.chainId).identifier ===
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
        ChainIdHelper.parse(chain.chainInfo.chainId).identifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });
    if (!chain) {
      return false;
    }

    return chain.supportsMemo;
  });

  isChainTypeEVM = computedFn((chainId: string): boolean => {
    const chain = this.chains.find((chain) => {
      return (
        ChainIdHelper.parse(chain.chainInfo.chainId).identifier ===
        ChainIdHelper.parse(chainId).identifier
      );
    });
    if (!chain) {
      return false;
    }

    return chain.chainType === "evm";
  });
}
