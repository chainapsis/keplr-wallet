import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  ChainType,
  Provider,
  RouteRequestV2,
  RouteResponseV2,
  RouteStepType,
} from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import Joi from "joi";
import { normalizeChainId, normalizeDenom } from "./utils";

const FeeTokenSchema = Joi.object({
  type: Joi.string().valid(ChainType.COSMOS, ChainType.EVM).required(),
  chain_id: Joi.string().required(),
  denom: Joi.string().required(),
  symbol: Joi.string().required(),
  name: Joi.string().required(),
  decimals: Joi.number().required(),
  coingecko_id: Joi.string().required(),
  image_url: Joi.string().required(),
}).unknown(true);

const RouteStepSchema = Joi.object({
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

const SkipOperationsSchema = Joi.array().items(
  Joi.object({
    transfer: Joi.object({
      port: Joi.string().required(),
      channel: Joi.string().required(),
      chain_id: Joi.string().required(),
      pfm_enabled: Joi.boolean(),
      dest_denom: Joi.string().required(),
      supports_memo: Joi.boolean(),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    swap: Joi.object({
      swap_in: Joi.object({
        swap_venue: Joi.object({
          name: Joi.string().required(),
          chain_id: Joi.string().required(),
        })
          .unknown(true)
          .required(),
        swap_operations: Joi.array()
          .items(
            Joi.object({
              pool: Joi.string().required(),
              denom_in: Joi.string().required(),
              denom_out: Joi.string().required(),
            }).unknown(true)
          )
          .required(),
        swap_amount_in: Joi.string().required(),
        price_impact_percent: Joi.string(),
      }).unknown(true),
      smart_swap_in: Joi.object({
        swap_venue: Joi.object({
          name: Joi.string().required(),
          chain_id: Joi.string().required(),
        })
          .unknown(true)
          .required(),
        swap_routes: Joi.array()
          .items(
            Joi.object({
              swap_amount_in: Joi.string().required(),
              denom_in: Joi.string().required(),
              swap_operations: Joi.array()
                .items(
                  Joi.object({
                    pool: Joi.string().required(),
                    denom_in: Joi.string().required(),
                    denom_out: Joi.string().required(),
                  }).unknown(true)
                )
                .required(),
            }).unknown(true)
          )
          .required(),
        estimated_amount_out: Joi.string().required(),
      }).unknown(true),
      estimated_affiliate_fee: Joi.string().required(),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    evm_swap: Joi.object({
      amount_in: Joi.string().required(),
      amount_out: Joi.string().required(),
      denom_in: Joi.string().required(),
      denom_out: Joi.string().required(),
      from_chain_id: Joi.string().required(),
      input_token: Joi.string().required(),
      swap_calldata: Joi.string().required(),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    cctp_transfer: Joi.object({
      bridge_id: Joi.string().required(),
      burn_token: Joi.string().required(),
      denom_in: Joi.string().required(),
      denom_out: Joi.string().required(),
      from_chain_id: Joi.string().required(),
      to_chain_id: Joi.string().required(),
      smart_relay: Joi.boolean().required(),
      smart_relay_fee_quote: Joi.object({
        fee_amount: Joi.string().required(),
        fee_denom: Joi.string().required(),
        relayer_address: Joi.string().required(),
        expiration: Joi.string().required(),
      })
        .required()
        .unknown(true),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    go_fast_transfer: Joi.object({
      from_chain_id: Joi.string().required(),
      to_chain_id: Joi.string().required(),
      fee: Joi.object({
        fee_asset: Joi.object({
          denom: Joi.string().required(),
          chain_id: Joi.string().required(),
          is_cw20: Joi.boolean().required(),
          is_evm: Joi.boolean().required(),
          is_svm: Joi.boolean().required(),
          symbol: Joi.string().required(),
          decimals: Joi.number().required(),
        })
          .required()
          .unknown(true),
        bps_fee: Joi.string().required(),
        bps_fee_amount: Joi.string().required(),
        bps_fee_usd: Joi.string().required(),
        source_chain_fee_amount: Joi.string().required(),
        source_chain_fee_usd: Joi.string().required(),
        destination_chain_fee_amount: Joi.string().required(),
        destination_chain_fee_usd: Joi.string().required(),
      })
        .required()
        .unknown(true),
      denom_in: Joi.string().required(),
      denom_out: Joi.string().required(),
      source_domain: Joi.string().required(),
      destination_domain: Joi.string().required(),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    axelar_transfer: Joi.object({
      from_chain: Joi.string().required(),
      from_chain_id: Joi.string().required(),
      to_chain: Joi.string().required(),
      to_chain_id: Joi.string().required(),
      asset: Joi.string().required(),
      should_unwrap: Joi.boolean().required(),
      denom_in: Joi.string().required(),
      denom_out: Joi.string().required(),
      fee_amount: Joi.string().required(),
      usd_fee_amount: Joi.string().required(),
      fee_asset: Joi.object({
        denom: Joi.string().required(),
        chain_id: Joi.string().required(),
        is_cw20: Joi.boolean().required(),
        is_evm: Joi.boolean().required(),
        is_svm: Joi.boolean().required(),
        symbol: Joi.string().required(),
        name: Joi.string().required(),
        decimals: Joi.number().required(),
      })
        .required()
        .unknown(true),
      bridge_id: Joi.string().required(),
      smart_relay: Joi.boolean().required(),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    hyperlane_transfer: Joi.object({
      from_chain_id: Joi.string().required(),
      to_chain_id: Joi.string().required(),
      denom_in: Joi.string().required(),
      denom_out: Joi.string().required(),
      hyperlane_contract_address: Joi.string().required(),
      fee_amount: Joi.string().required(),
      usd_fee_amount: Joi.string().required(),
      fee_asset: Joi.object({
        denom: Joi.string().required(),
        chain_id: Joi.string().required(),
        is_cw20: Joi.boolean().required(),
        is_evm: Joi.boolean().required(),
        is_svm: Joi.boolean().required(),
        symbol: Joi.string().required(),
        decimals: Joi.number().required(),
      })
        .required()
        .unknown(true),
      bridge_id: Joi.string().required(),
      smart_relay: Joi.boolean().required(),
    })
      .required()
      .unknown(true),
  }).unknown(true),
  Joi.object({
    eureka_transfer: Joi.object({
      bridge_id: Joi.string().required(),
      callback_adapter_contract_address: Joi.string().required(),
      destination_port: Joi.string().required(),
      entry_contract_address: Joi.string().required(),
      denom_in: Joi.string().required(),
      denom_out: Joi.string().required(),
      source_client: Joi.string().required(),
      from_chain_id: Joi.string().required(),
      to_chain_id: Joi.string().required(),
      to_chain_callback_contract_address: Joi.string().required(),
      to_chain_entry_contract_address: Joi.string().required(),
      pfm_enabled: Joi.boolean().required(),
      smart_relay: Joi.boolean().required(),
      smart_relay_fee_quote: Joi.object({
        fee_amount: Joi.string().required(),
        fee_denom: Joi.string().required(),
        relayer_address: Joi.string().required(),
        expiration: Joi.string().required(),
      })
        .required()
        .unknown(true),
      supports_memo: Joi.boolean().required(),
    })
      .required()
      .unknown(true),
  }).unknown(true)
);

const RouteResponseV2Schema = Joi.object<RouteResponseV2>({
  provider: Joi.string().valid(Provider.SKIP, Provider.SQUID).required(),
  amount_out: Joi.string().required(),
  estimated_time: Joi.number().required(),
  fees: Joi.array()
    .items(
      Joi.object({
        usd_amount: Joi.string().required(),
        amount: Joi.string().required(),
        fee_token: FeeTokenSchema.required(),
      }).unknown(true)
    )
    .required(),
  steps: Joi.array().items(RouteStepSchema).required(),
  required_chain_ids: Joi.array().items(Joi.string()).required(),
  skip_operations: SkipOperationsSchema.required(),
  price_impact_percent: Joi.string(),
}).unknown(true);

export class ObservableQueryRouteInnerV2 extends ObservableQuery<RouteResponseV2> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    public readonly fromChainId: string,
    public readonly fromDenom: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly fromAddress: string,
    public readonly toAddress: string,
    public readonly fromAmount: string,
    public readonly slippage: number
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
  get provider(): Provider | undefined {
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

    // 동일한 denom의 fee가 있으면 합치기
    // CHECK: usd amount랑 이미지랑 다 주는데 그냥 원본값 반환하기 or 가공해서 반환하기
    const feeMap = new Map<string, CoinPretty>();
    for (const fee of fees) {
      const coinPretty = new CoinPretty(
        this.chainStore.hasChain(fee.fee_token.chain_id)
          ? this.chainStore
              .getChain(fee.fee_token.chain_id)
              .forceFindCurrency(fee.fee_token.denom)
          : this.chainStore
              .getChain(`eip155:${fee.fee_token.chain_id}`)
              .forceFindCurrency(
                (() => {
                  if (fee.fee_token.denom.startsWith("0x")) {
                    return `erc20:${fee.fee_token.denom.toLowerCase()}`;
                  }
                  return fee.fee_token.denom;
                })()
              ),
        fee.amount
      );

      const denom = fee.fee_token.denom;
      if (feeMap.has(denom)) {
        feeMap.get(denom)!.add(coinPretty);
      } else {
        feeMap.set(denom, coinPretty);
      }
    }

    return Array.from(feeMap.values());
  }

  @computed
  get swapPriceImpact(): RatePretty | undefined {
    if (!this.response || !this.response.data.price_impact_percent) {
      return undefined;
    }

    return new RatePretty(new Dec(this.response.data.price_impact_percent));
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: RouteResponseV2 }> {
    const request: RouteRequestV2 = {
      from_chain: normalizeChainId(this.fromChainId),
      from_token: normalizeDenom(
        this.chainStore,
        this.fromChainId,
        this.fromDenom
      ),
      to_chain: normalizeChainId(this.toChainId),
      to_token: normalizeDenom(this.chainStore, this.toChainId, this.toDenom),
      from_address: this.fromAddress,
      to_address: this.toAddress,
      amount: this.fromAmount,
      slippage: this.slippage,
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
    const request: RouteRequestV2 = {
      from_chain: this.fromChainId,
      from_token: this.fromDenom,
      to_chain: this.toChainId,
      to_token: this.toDenom,
      from_address: this.fromAddress,
      to_address: this.toAddress,
      amount: this.fromAmount,
      slippage: this.slippage,
    };
    return `${super.getCacheKey()}-${JSON.stringify(request)}`;
  }
}

export class ObservableQueryRouteV2 extends HasMapStore<ObservableQueryRouteInnerV2> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((str) => {
      const parsed: RouteRequestV2 = JSON.parse(str);

      return new ObservableQueryRouteInnerV2(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        parsed.from_chain,
        parsed.from_token,
        parsed.to_chain,
        parsed.to_token,
        parsed.from_address,
        parsed.to_address,
        parsed.amount,
        parsed.slippage
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
    slippage: number
  ): ObservableQueryRouteInnerV2 {
    // NOTE: not normalized yet, should be normalized before fetching
    const rawRequest: RouteRequestV2 = {
      from_chain: fromChainId,
      from_token: fromDenom,
      to_chain: toChainId,
      to_token: toDenom,
      from_address: fromAddress,
      to_address: toAddress,
      amount: fromAmount,
      slippage: slippage,
    };

    const str = JSON.stringify(rawRequest);

    return this.get(str);
  }
}
