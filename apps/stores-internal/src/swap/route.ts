import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  ChainType,
  Provider,
  V2RouteRequest,
  V2RouteResponse,
  RouteStepType,
  RouteTransaction,
} from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import Joi from "joi";

const Schema = Joi.object<V2RouteResponse>({
  provider: Joi.string().valid(Provider.SKIP, Provider.SQUID).required(),
  amount_out: Joi.string().required(),
  estimated_time: Joi.number().required(),
  fees: Joi.array().items(
    Joi.object({
      usd_amount: Joi.string().required(),
      amount: Joi.string().required(),
      fee_token: Joi.object({
        type: Joi.string().valid(ChainType.COSMOS, ChainType.EVM).required(),
        chain_id: Joi.string().required(),
        denom: Joi.string().required(),
        symbol: Joi.string().required(),
        name: Joi.string().required(),
      }),
    }).unknown(true)
  ),
  steps: Joi.array().items(
    Joi.object({
      type: Joi.string()
        .valid(
          RouteStepType.SWAP,
          RouteStepType.BRIDGE,
          RouteStepType.IBC_TRANSFER
        )
        .required(),
      from_chain: Joi.string().required(),
      to_chain: Joi.string().required(),
      from_token: Joi.string().required(),
      to_token: Joi.string().required(),
      from_amount: Joi.string().required(),
      to_amount: Joi.string().required(),
    }).unknown(true)
  ),
  transactions: Joi.array().items(
    Joi.alternatives().conditional(Joi.ref(".chain_type"), {
      switch: [
        {
          is: ChainType.COSMOS,
          then: Joi.object({
            chain_type: Joi.string().valid(ChainType.COSMOS).required(),
            tx_data: Joi.object({
              chain_id: Joi.string().required(),
              signer_address: Joi.string().required(),
              msgs: Joi.array()
                .items(
                  Joi.object({
                    type: Joi.string().required(),
                    value: Joi.any().required(),
                  })
                )
                .required(), // TODO: add schema for msgs
            })
              .unknown(true)
              .required(),
          }),
        },
        {
          is: ChainType.EVM,
          then: Joi.object({
            chain_type: Joi.string().valid(ChainType.EVM).required(),
            tx_data: Joi.object({
              chain_id: Joi.string().required(),
              to: Joi.string().required(),
              data: Joi.string().required(),
              value: Joi.string().required(),
              gas_limit: Joi.string().optional(),
              gas_price: Joi.string().optional(),
              max_fee_per_gas: Joi.string().optional(),
              max_priority_fee_per_gas: Joi.string().optional(),
              approvals: Joi.array()
                .items(
                  Joi.object({
                    token_contract: Joi.string().required(),
                    spender: Joi.string().required(),
                    amount: Joi.string().required(),
                  })
                )
                .required(),
            })
              .unknown(true)
              .required(),
          }),
        },
      ],
    })
  ),
}).unknown(true);

export class ObservableQueryRouteV2Inner extends ObservableQuery<V2RouteResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    baseURL: string,
    public readonly fromChainId: string,
    public readonly fromAmount: string,
    public readonly fromDenom: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly chainIdsToAddresses: Record<string, string>,
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
  get outAmount(): CoinPretty {
    if (!this.response) {
      return new CoinPretty(
        this.chainGetter
          .getChain(this.toChainId)
          .forceFindCurrency(this.toDenom),
        "0"
      );
    }

    return new CoinPretty(
      this.chainGetter.getChain(this.toChainId).forceFindCurrency(this.toDenom),
      this.response.data.amount_out
    );
  }

  // NOTE: 브릿지 수수료, tx 수수료 구분이 안되어 있어서 백엔드 쪽에서 확인하고 처리해야 함

  // 프로퍼티 이름이 애매하긴 한데... 일단 skip response에서 estimated_fees를 차리하기 위한 property이고
  // 현재 이 값은 브릿징 수수료를 의미한다.
  // @computed
  // get otherFees(): CoinPretty[] {
  //   if (!this.response) {
  //     return [];
  //   }
  //   if (!this.response.data.fees) {
  //     return [];
  //   }

  //   // return this.response.data.fees.map((fee) => {
  //   //   return new CoinPretty(
  //   //     this.chainGetter.hasChain(fee.origin_asset.chain_id)
  //   //       ? this.chainGetter
  //   //           .getChain(fee.origin_asset.chain_id)
  //   //           .forceFindCurrency(fee.origin_asset.denom)
  //   //       : this.chainGetter
  //   //           .getChain(`eip155:${fee.origin_asset.chain_id}`)
  //   //           .forceFindCurrency(
  //   //             (() => {
  //   //               if (fee.origin_asset.denom.startsWith("0x")) {
  //   //                 return `erc20:${fee.origin_asset.denom.toLowerCase()}`;
  //   //               }

  //   //               return fee.origin_asset.denom;
  //   //             })()
  //   //           ),
  //   //     fee.amount
  //   //   );
  //   // });

  //   return [];
  // }

  // @computed
  // get swapFee(): CoinPretty[] {
  //   if (!this.response) {
  //     return [
  //       new CoinPretty(
  //         this.chainGetter
  //           .getChain(this.toChainId)
  //           .forceFindCurrency(this.toDenom),
  //         "0"
  //       ),
  //     ];
  //   }

  //   const estimatedAffiliateFees: {
  //     fee: string;
  //     venueChainId: string;
  //   }[] = [];

  //   for (const operation of this.response.data.operations) {
  //     if ("swap" in operation) {
  //       const swapIn = operation.swap.swap_in ?? operation.swap.smart_swap_in;
  //       if (swapIn) {
  //         estimatedAffiliateFees.push({
  //           fee: operation.swap.estimated_affiliate_fee,
  //           // QUESTION: swap_out이 생기면...?
  //           venueChainId: swapIn.swap_venue.chain_id,
  //         });
  //       }
  //     }
  //   }

  //   return estimatedAffiliateFees.map(({ fee, venueChainId }) => {
  //     const split = fee.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

  //     if (split.length !== 5) {
  //       throw new Error(`Invalid fee format: ${fee}`);
  //     }

  //     const amount = split[1];
  //     const denom = split[3];

  //     return new CoinPretty(
  //       this.chainGetter.getChain(venueChainId).forceFindCurrency(denom),
  //       amount
  //     );
  //   });
  // }

  @computed
  get transactions(): RouteTransaction[] {
    if (!this.response) {
      return [];
    }

    if (this.response.data.transactions.length === 0) {
      return [];
    }

    return this.response.data.transactions;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: V2RouteResponse }> {
    const request: V2RouteRequest = {
      from_chain: this.fromChainId,
      from_token: this.fromDenom,
      to_chain: this.toChainId,
      to_token: this.toDenom,
      amount: this.fromAmount,
      chain_ids_to_addresses: this.chainIdsToAddresses,
      slippage: this.slippage,
    };

    const _result = await simpleFetch<V2RouteResponse>(this.baseURL, this.url, {
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
    const request: V2RouteRequest = {
      from_chain: this.fromChainId,
      from_token: this.fromDenom,
      to_chain: this.toChainId,
      to_token: this.toDenom,
      amount: this.fromAmount,
      chain_ids_to_addresses: this.chainIdsToAddresses,
      slippage: this.slippage,
    };
    return `${super.getCacheKey()}-${JSON.stringify(request)}`;
  }
}

// NOTE: named as ObservableQueryRouteV2 to avoid confusion with ObservableQueryRoute in skip directory
export class ObservableQueryRouteV2 extends HasMapStore<ObservableQueryRouteV2Inner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly baseURL: string
  ) {
    super((str) => {
      const parsed: V2RouteRequest = JSON.parse(str);

      return new ObservableQueryRouteV2Inner(
        this.sharedContext,
        this.chainGetter,
        this.baseURL,
        parsed.from_chain,
        parsed.from_token,
        parsed.to_chain,
        parsed.to_token,
        parsed.amount,
        parsed.chain_ids_to_addresses,
        parsed.slippage
      );
    });
  }

  getRoute(
    fromChainId: string,
    fromAmount: CoinPretty,
    toChainId: string,
    toDenom: string,
    chainIdsToAddresses: Record<string, string>,
    slippage: number
  ): ObservableQueryRouteV2Inner {
    const request: V2RouteRequest = {
      from_chain: fromChainId,
      from_token: fromAmount.currency.coinMinimalDenom,
      to_chain: toChainId,
      to_token: toDenom,
      amount: fromAmount.toCoin().amount,
      chain_ids_to_addresses: chainIdsToAddresses,
      slippage: slippage,
    };

    const str = JSON.stringify(request);

    return this.get(str);
  }
}
