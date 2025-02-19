import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { RouteResponse } from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import Joi from "joi";

const Schema = Joi.object<RouteResponse>({
  source_asset_denom: Joi.string().required(),
  source_asset_chain_id: Joi.string().required(),
  dest_asset_denom: Joi.string().required(),
  dest_asset_chain_id: Joi.string().required(),
  amount_in: Joi.string().required(),
  amount_out: Joi.string().required(),
  operations: Joi.array()
    .items(
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
        evm_swap: Joi.object({
          amount_in: Joi.string().required(),
          amount_out: Joi.string().required(),
          denom_in: Joi.string().required(),
          denom_out: Joi.string().required(),
          from_chain_id: Joi.string().required(),
          swap_calldata: Joi.string().required(),
          swap_venues: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                chain_id: Joi.string().required(),
                logo_uri: Joi.string().required(),
              }).unknown(true)
            )
            .required(),
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
            decimals: Joi.number().required(),
          }).unknown(true),
          bridge_id: Joi.string().required(),
          smart_relay: Joi.boolean().required(),
        }).unknown(true),
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
          }).unknown(true),
          bridge_id: Joi.string().required(),
          smart_relay: Joi.boolean().required(),
        }).unknown(true),
      }).unknown(true)
    )
    .required(),
  chain_ids: Joi.array().items(Joi.string()).required(),
  does_swap: Joi.boolean(),
  estimated_amount_out: Joi.string(),
  swap_price_impact_percent: Joi.string(),
  swap_venue: Joi.object({
    name: Joi.string().required(),
    chain_id: Joi.string().required(),
  }).unknown(true),
  swap_venues: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      chain_id: Joi.string().required(),
    }).unknown(true)
  ),
  txs_required: Joi.number().required(),
  estimated_fees: Joi.array().items(
    Joi.object({
      amount: Joi.string().required(),
      origin_asset: Joi.object({
        denom: Joi.string().required(),
        chain_id: Joi.string().required(),
      }).unknown(true),
    }).unknown(true)
  ),
  estimated_route_duration_seconds: Joi.number(),
}).unknown(true);

export class ObservableQueryRouteInner extends ObservableQuery<RouteResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    skipURL: string,
    public readonly sourceChainId: string,
    public readonly sourceAmount: string,
    public readonly sourceDenom: string,
    public readonly destChainId: string,
    public readonly destDenom: string,
    public readonly affiliateFeeBps: number,
    public readonly swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[],
    public readonly allowSwaps?: boolean,
    public readonly smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ) {
    super(sharedContext, skipURL, "/v2/fungible/route");
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.sourceAmount || this.sourceAmount === "0") {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get outAmount(): CoinPretty {
    if (!this.response) {
      return new CoinPretty(
        this.chainGetter
          .getChain(this.destChainId)
          .forceFindCurrency(this.destDenom),
        "0"
      );
    }

    return new CoinPretty(
      this.chainGetter
        .getChain(this.destChainId)
        .forceFindCurrency(this.destDenom),
      this.response.data.amount_out
    );
  }

  // 프로퍼티 이름이 애매하긴 한데... 일단 skip response에서 estimated_fees를 차리하기 위한 property이고
  // 현재 이 값은 브릿징 수수료를 의미한다.
  @computed
  get otherFees(): CoinPretty[] {
    if (!this.response) {
      return [];
    }
    if (!this.response.data.estimated_fees) {
      return [];
    }

    return this.response.data.estimated_fees.map((fee) => {
      return new CoinPretty(
        this.chainGetter.hasChain(fee.origin_asset.chain_id)
          ? this.chainGetter
              .getChain(fee.origin_asset.chain_id)
              .forceFindCurrency(fee.origin_asset.denom)
          : this.chainGetter
              .getChain(`eip155:${fee.origin_asset.chain_id}`)
              .forceFindCurrency(
                (() => {
                  if (fee.origin_asset.denom.startsWith("0x")) {
                    return `erc20:${fee.origin_asset.denom.toLowerCase()}`;
                  }

                  return fee.origin_asset.denom;
                })()
              ),
        fee.amount
      );
    });
  }

  @computed
  get swapFee(): CoinPretty[] {
    if (!this.response) {
      return [
        new CoinPretty(
          this.chainGetter
            .getChain(this.destChainId)
            .forceFindCurrency(this.destDenom),
          "0"
        ),
      ];
    }

    const estimatedAffiliateFees: {
      fee: string;
      venueChainId: string;
    }[] = [];

    for (const operation of this.response.data.operations) {
      if ("swap" in operation) {
        const swapIn = operation.swap.swap_in ?? operation.swap.smart_swap_in;
        if (swapIn) {
          estimatedAffiliateFees.push({
            fee: operation.swap.estimated_affiliate_fee,
            // QUESTION: swap_out이 생기면...?
            venueChainId: swapIn.swap_venue.chain_id,
          });
        }
      }
    }

    return estimatedAffiliateFees.map(({ fee, venueChainId }) => {
      const split = fee.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

      if (split.length !== 5) {
        throw new Error(`Invalid fee format: ${fee}`);
      }

      const amount = split[1];
      const denom = split[3];

      return new CoinPretty(
        this.chainGetter.getChain(venueChainId).forceFindCurrency(denom),
        amount
      );
    });
  }

  @computed
  get swapPriceImpact(): RatePretty | undefined {
    if (!this.response || !this.response.data.swap_price_impact_percent) {
      return undefined;
    }

    return new RatePretty(
      new Dec(this.response.data.swap_price_impact_percent).quoTruncate(
        new Dec(100)
      )
    );
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: RouteResponse }> {
    const _result = await simpleFetch<RouteResponse>(this.baseURL, this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(() => {
          const res: { authorization?: string } = {};
          if (process.env["SKIP_API_KEY"]) {
            res.authorization = process.env["SKIP_API_KEY"];
          }

          return res;
        })(),
      },
      body: JSON.stringify({
        amount_in: this.sourceAmount,
        source_asset_denom: this.sourceDenom.replace("erc20:", ""),
        source_asset_chain_id: this.sourceChainId.replace("eip155:", ""),
        dest_asset_denom: this.destDenom.replace("erc20:", ""),
        dest_asset_chain_id: this.destChainId.replace("eip155:", ""),
        cumulative_affiliate_fee_bps: this.affiliateFeeBps.toString(),
        swap_venues: this.swapVenues
          .map((swapVenue) => ({
            ...swapVenue,
            chainId: swapVenue.chainId.replace("eip155:", ""),
          }))
          // 임시로 추가된 swap venue는 제외
          .filter((swapVenue) => !swapVenue.name.startsWith("temp-")),
        allow_unsafe: true,
        smart_relay: true,
        go_fast: true,
        experimental_features: ["hyperlane"],
        smart_swap_options: {
          evm_swaps:
            this.smartSwapOptions?.evmSwaps === undefined
              ? true
              : this.smartSwapOptions.evmSwaps,
          split_routes:
            this.smartSwapOptions?.splitRoutes === undefined
              ? true
              : this.smartSwapOptions.splitRoutes,
        },
        ...(this.allowSwaps !== undefined && {
          allow_swaps: this.allowSwaps,
        }),
      }),
      signal: abortController.signal,
    });
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = Schema.validate(result.data);

    if (validated.error) {
      console.log("Failed to validate route response", validated.error);
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      amount_in: this.sourceAmount,
      source_asset_denom: this.sourceDenom,
      source_asset_chain_id: this.sourceChainId,
      dest_asset_denom: this.destDenom,
      dest_asset_chain_id: this.destChainId,
      affiliateFeeBps: this.affiliateFeeBps,
      swap_venue: this.swapVenues,
      allow_swaps: this.allowSwaps,
      smart_swap_options: this.smartSwapOptions,
    })}`;
  }
}

export class ObservableQueryRoute extends HasMapStore<ObservableQueryRouteInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly skipURL: string
  ) {
    super((str) => {
      const parsed = JSON.parse(str);

      return new ObservableQueryRouteInner(
        this.sharedContext,
        this.chainGetter,
        this.skipURL,
        parsed.sourceChainId,
        parsed.sourceAmount,
        parsed.sourceDenom,
        parsed.destChainId,
        parsed.destDenom,
        parsed.affiliateFeeBps,
        parsed.swapVenues,
        parsed.allowSwaps,
        {
          evmSwaps: parsed.smartSwapOptions?.evmSwaps,
        }
      );
    });
  }

  getRoute(
    sourceChainId: string,
    amount: CoinPretty,
    destChainId: string,
    destDenom: string,
    affiliateFeeBps: number,
    swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[],
    allowSwaps?: boolean,
    smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ): ObservableQueryRouteInner {
    const str = JSON.stringify({
      sourceChainId,
      sourceAmount: amount.toCoin().amount,
      sourceDenom: amount.currency.coinMinimalDenom,
      destChainId,
      destDenom,
      affiliateFeeBps,
      swapVenues,
      allowSwaps,
      smartSwapOptions,
    });
    return this.get(str);
  }
}
