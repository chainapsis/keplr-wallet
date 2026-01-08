import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  SwapChainType,
  SwapFee,
  SwapFeeToken,
  SwapProvider,
  RouteRequestV2,
  RouteResponseV2,
  RouteStepType,
  RouteStep,
} from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import Joi from "joi";
import { normalizeChainId, normalizeDenom } from "./utils";

const FeeTokenSchema = Joi.object<SwapFeeToken>({
  type: Joi.string().valid(SwapChainType.COSMOS, SwapChainType.EVM).required(),
  chain_id: Joi.string().required(),
  denom: Joi.string().required(),
  symbol: Joi.string().required(),
  name: Joi.string().required(),
  decimals: Joi.number().required(),
  coingecko_id: Joi.string().allow(null).optional(),
  image_url: Joi.string().allow(null).optional(),
}).unknown(true);

const FeeSchema = Joi.object<SwapFee>({
  usd_amount: Joi.string().required(),
  amount: Joi.string().required(),
  fee_token: FeeTokenSchema.required(),
}).unknown(true);

const RouteStepSchema = Joi.object<RouteStep>({
  type: Joi.string()
    .valid(RouteStepType.SWAP, RouteStepType.BRIDGE, RouteStepType.IBC_TRANSFER)
    .required(),
  from_chain: Joi.string().required(),
  to_chain: Joi.string().required(),
  from_token: Joi.string().required(),
  to_token: Joi.string().required(),
  from_amount: Joi.string().required(),
  to_amount: Joi.string().required(),
}).unknown(true);

// Minimal schema validation for skip_operations - all fields are optional/nullable
// Optimistic validation: just ensure it's an array of objects
const SkipOperationSchema = Joi.object().unknown(true);

const RouteResponseV2Schema = Joi.object<RouteResponseV2>({
  provider: Joi.string()
    .valid(SwapProvider.SKIP, SwapProvider.SQUID)
    .required(),
  amount_out: Joi.string().required(),
  estimated_time: Joi.number().required(),
  fees: Joi.array().items(FeeSchema).required(),
  steps: Joi.array().items(RouteStepSchema).required(),
  required_chain_ids: Joi.array().items(Joi.string()).required(),
  skip_operations: Joi.when("provider", {
    is: SwapProvider.SKIP,
    then: Joi.array().items(SkipOperationSchema).required(),
    otherwise: Joi.array().items(SkipOperationSchema).optional(),
  }),
  price_impact_percent: Joi.number().required(),
}).unknown(true);

export class ObservableQueryRouteInnerV2 extends ObservableQuery<RouteResponseV2> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    public readonly fromChainId: string,
    public readonly fromDenom: string,
    public readonly fromAmount: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly fromAddress: string,
    public readonly toAddress: string,
    public readonly slippage: number,
    public readonly providers?: SwapProvider[]
  ) {
    super(sharedContext, baseURL, "/v2/swap/route");
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.fromAmount || this.fromAmount === "0") {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get provider(): SwapProvider | undefined {
    if (!this.response) {
      return undefined;
    }
    return this.response.data.provider;
  }

  @computed
  get outAmount(): CoinPretty {
    if (!this.response) {
      return new CoinPretty(
        this.chainStore
          .getChain(this.toChainId)
          .forceFindCurrency(this.toDenom),
        "0"
      );
    }

    return new CoinPretty(
      this.chainStore.getChain(this.toChainId).forceFindCurrency(this.toDenom),
      this.response.data.amount_out
    );
  }

  @computed
  get bridgeFees(): CoinPretty[] {
    if (!this.response) {
      return [];
    }
    if (!this.response.data.fees || this.response.data.fees.length === 0) {
      return [];
    }

    const fees = this.response.data.fees;

    // merge same denom fees
    const feeMap = new Map<string, CoinPretty>();
    for (const fee of fees) {
      const evmLikeChainId = Number(fee.fee_token.chain_id);
      const isEVMLikeChainId =
        !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;

      const chainId = isEVMLikeChainId
        ? `eip155:${evmLikeChainId}`
        : fee.fee_token.chain_id;
      const denom = (() => {
        if (isEVMLikeChainId) {
          if (
            fee.fee_token.denom === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          ) {
            return this.chainStore.getChain(chainId).currencies[0]
              .coinMinimalDenom;
          }
          return `erc20:${fee.fee_token.denom}`;
        } else {
          return fee.fee_token.denom;
        }
      })();

      const coinPretty = this.chainStore.hasChain(chainId)
        ? new CoinPretty(
            this.chainStore.getChain(chainId).forceFindCurrency(denom),
            fee.amount
          )
        : undefined;
      if (coinPretty) {
        if (feeMap.has(denom)) {
          feeMap.get(denom)!.add(coinPretty);
        } else {
          feeMap.set(denom, coinPretty);
        }
      }
    }

    return Array.from(feeMap.values());
  }

  @computed
  get swapPriceImpact(): RatePretty | undefined {
    if (!this.response || !this.response.data.price_impact_percent) {
      return undefined;
    }

    return new RatePretty(
      new Dec(this.response.data.price_impact_percent).quoTruncate(new Dec(100))
    );
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: RouteResponseV2 }> {
    const request: RouteRequestV2 = {
      from_chain: normalizeChainId(this.fromChainId),
      from_token: normalizeDenom(
        this.chainStore,
        this.fromChainId,
        this.fromDenom,
        true
      ),
      amount: this.fromAmount,
      to_chain: normalizeChainId(this.toChainId),
      to_token: normalizeDenom(
        this.chainStore,
        this.toChainId,
        this.toDenom,
        true
      ),
      from_address: this.fromAddress,
      to_address: this.toAddress,
      slippage: this.slippage,
      providers: this.providers,
    };

    const _result = await simpleFetch<RouteResponseV2>(this.baseURL, this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
      signal: abortController.signal,
    });
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = RouteResponseV2Schema.validate(result.data);

    if (validated.error) {
      console.error("Failed to validate route response", validated.error);
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      fromChainId: normalizeChainId(this.fromChainId),
      fromDenom: normalizeDenom(
        this.chainStore,
        this.fromChainId,
        this.fromDenom
      ),
      fromAmount: this.fromAmount,
      toChainId: normalizeChainId(this.toChainId),
      toDenom: normalizeDenom(this.chainStore, this.toChainId, this.toDenom),
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      slippage: this.slippage,
    })}`;
  }
}

export class ObservableQueryRouteV2 extends HasMapStore<ObservableQueryRouteInnerV2> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((str) => {
      const parsed = JSON.parse(str);

      return new ObservableQueryRouteInnerV2(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        parsed.fromChainId,
        parsed.fromDenom,
        parsed.fromAmount,
        parsed.toChainId,
        parsed.toDenom,
        parsed.fromAddress,
        parsed.toAddress,
        parsed.slippage,
        parsed.providers
      );
    });
  }

  getRoute(
    fromChainId: string,
    fromDenom: string,
    fromAmount: string,
    toChainId: string,
    toDenom: string,
    fromAddress: string,
    toAddress: string,
    slippage: number,
    providers?: SwapProvider[]
  ): ObservableQueryRouteInnerV2 {
    const str = JSON.stringify({
      fromChainId,
      fromDenom,
      fromAmount,
      toChainId,
      toDenom,
      fromAddress,
      toAddress,
      slippage,
      providers,
    });

    return this.get(str);
  }
}
