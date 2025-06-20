import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { MsgsDirectResponse } from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import Joi from "joi";

const Schema = Joi.object<MsgsDirectResponse>({
  msgs: Joi.array()
    .items(
      Joi.object({
        multi_chain_msg: Joi.object({
          chain_id: Joi.string().required(),
          path: Joi.array().items(Joi.string()).required(),
          msg: Joi.string().required(),
          msg_type_url: Joi.string().required(),
        }).unknown(true),
        evm_tx: Joi.object({
          chain_id: Joi.string().required(),
          data: Joi.string().required(),
          required_erc20_approvals: Joi.array()
            .items(
              Joi.object({
                amount: Joi.string().required(),
                spender: Joi.string().required(),
                token_contract: Joi.string().required(),
              }).unknown(true)
            )
            .required(),
          signer_address: Joi.string().required(),
          to: Joi.string().required(),
          value: Joi.string().required(),
        }).unknown(true),
      }).unknown(true)
    )
    .required(),
  txs: Joi.array()
    .items(
      Joi.object({
        cosmos_tx: Joi.object({
          chain_id: Joi.string().required(),
          path: Joi.array().items(Joi.string()).required(),
          msgs: Joi.array()
            .items(
              Joi.object({
                msg: Joi.string().required(),
                msg_type_url: Joi.string().required(),
              }).unknown(true)
            )
            .required(),
          signer_address: Joi.string().required(),
        }).unknown(true),
        evm_tx: Joi.object({
          chain_id: Joi.string().required(),
          data: Joi.string().required(),
          required_erc20_approvals: Joi.array()
            .items(
              Joi.object({
                amount: Joi.string().required(),
                spender: Joi.string().required(),
                token_contract: Joi.string().required(),
              }).unknown(true)
            )
            .required(),
          signer_address: Joi.string().required(),
          to: Joi.string().required(),
          value: Joi.string().required(),
        }).unknown(true),
      }).unknown(true)
    )
    .required(),
  route: Joi.object({
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
  })
    .unknown(true)
    .required(),
}).unknown(true);

export class ObservableQueryMsgsDirectInner extends ObservableQuery<MsgsDirectResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    skipURL: string,
    public readonly amountInDenom: string,
    public readonly amountInAmount: string,
    public readonly sourceAssetChainId: string,
    public readonly destAssetDenom: string,
    public readonly destAssetChainId: string,
    public readonly chainIdsToAddresses: Record<string, string>,
    public readonly slippageTolerancePercent: number,
    public readonly affiliateFeeBps: number,
    public readonly affiliateFeeReceivers: {
      chainId: string;
      address: string;
    }[],
    public readonly swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[],
    public readonly smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ) {
    super(sharedContext, skipURL, "/v1/msgs_direct");

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.amountInAmount || this.amountInAmount === "0") {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get outAmount(): CoinPretty {
    if (!this.response) {
      return new CoinPretty(
        this.chainGetter
          .getChain(this.destAssetChainId)
          .forceFindCurrency(this.destAssetDenom),
        "0"
      );
    }

    return new CoinPretty(
      this.chainGetter
        .getChain(this.destAssetChainId)
        .forceFindCurrency(this.destAssetDenom),
      this.response.data.route.amount_out
    );
  }

  // 프로퍼티 이름이 애매하긴 한데... 일단 skip response에서 estimated_fees를 차리하기 위한 property이고
  // 현재 이 값은 브릿징 수수료를 의미한다.
  @computed
  get otherFees(): CoinPretty[] {
    if (!this.response) {
      return [];
    }
    if (!this.response.data.route.estimated_fees) {
      return [];
    }

    return this.response.data.route.estimated_fees.map((fee) => {
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
            .getChain(this.destAssetChainId)
            .forceFindCurrency(this.destAssetDenom),
          "0"
        ),
      ];
    }

    const estimatedAffiliateFees: {
      fee: string;
      venueChainId: string;
    }[] = [];

    for (const operation of this.response.data.route.operations) {
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
    if (!this.response || !this.response.data.route.swap_price_impact_percent) {
      return undefined;
    }

    return new RatePretty(
      new Dec(this.response.data.route.swap_price_impact_percent).quoTruncate(
        new Dec(100)
      )
    );
  }

  @computed
  get msg():
    | {
        type: "MsgTransfer";
        receiver: string;
        sourcePort: string;
        sourceChannel: string;
        counterpartyChainId: string;
        timeoutTimestamp: number;
        token: CoinPretty;
        memo: string;
      }
    | {
        type: "MsgExecuteContract";
        funds: CoinPretty[];
        contract: string;
        msg: object;
      }
    | {
        type: "evmTx";
        chainId: string;
        to: string;
        value: string;
        data: string;
        requiredErc20Approvals?: {
          amount: string;
          spender: string;
          tokenAddress: string;
        }[];
      }
    | {
        type: "MsgCCTP";
        msgs: {
          msg: string;
          msg_type_url: string;
        }[];
      }
    | undefined {
    if (!this.response) {
      return;
    }

    if (this.response.data.txs.length === 0) {
      return;
    }

    if (this.response.data.txs.length >= 2) {
      return;
    }

    const msg = this.response.data.txs[0];

    if (msg.evm_tx) {
      return {
        type: "evmTx",
        chainId: `eip155:${msg.evm_tx.chain_id}`,
        to: msg.evm_tx.to,
        value: `0x${BigInt(msg.evm_tx.value).toString(16)}`,
        data: `0x${msg.evm_tx.data}`,
        requiredErc20Approvals: msg.evm_tx.required_erc20_approvals.map(
          (approval) => ({
            amount: approval.amount,
            spender: approval.spender,
            tokenAddress: approval.token_contract,
          })
        ),
      };
    }

    if (msg.cosmos_tx) {
      const isCCTP =
        msg.cosmos_tx.msgs.length === 2 &&
        msg.cosmos_tx.msgs[0].msg_type_url ===
          "/circle.cctp.v1.MsgDepositForBurnWithCaller";
      if (isCCTP) {
        return {
          type: "MsgCCTP",
          msgs: msg.cosmos_tx.msgs,
        };
      }

      if (msg.cosmos_tx.msgs.length >= 2) {
        return;
      }

      const cosmosMsg = msg.cosmos_tx.msgs[0];
      if (
        cosmosMsg.msg_type_url !==
          "/ibc.applications.transfer.v1.MsgTransfer" &&
        cosmosMsg.msg_type_url !== "/cosmwasm.wasm.v1.MsgExecuteContract"
      ) {
        return;
      }

      const chainMsg = JSON.parse(cosmosMsg.msg);
      if (cosmosMsg.msg_type_url === "/cosmwasm.wasm.v1.MsgExecuteContract") {
        return {
          type: "MsgExecuteContract",
          funds: chainMsg.funds.map(
            (fund: { denom: string; amount: string }) => {
              return new CoinPretty(
                this.chainGetter
                  .getChain(msg.cosmos_tx!.chain_id)
                  .forceFindCurrency(fund.denom),
                fund.amount
              );
            }
          ),
          contract: chainMsg.contract,
          msg: chainMsg.msg,
        };
      } else if (
        cosmosMsg.msg_type_url === "/ibc.applications.transfer.v1.MsgTransfer"
      ) {
        if (msg.cosmos_tx.path.length < 2) {
          return;
        }

        return {
          type: "MsgTransfer",
          receiver: chainMsg.receiver,
          sourcePort: chainMsg.source_port,
          sourceChannel: chainMsg.source_channel,
          counterpartyChainId: msg.cosmos_tx.path[1],
          timeoutTimestamp: chainMsg.timeout_timestamp,
          token: new CoinPretty(
            this.chainGetter
              .getChain(msg.cosmos_tx.chain_id)
              .forceFindCurrency(chainMsg.token.denom),
            chainMsg.token.amount
          ),
          memo: chainMsg.memo,
        };
      }
    }

    throw new Error("Unknown error");
  }

  getMsgOrThrow():
    | {
        type: "MsgTransfer";
        receiver: string;
        sourcePort: string;
        sourceChannel: string;
        timeoutTimestamp: number;
        token: CoinPretty;
        memo: string;
      }
    | {
        type: "MsgExecuteContract";
        funds: CoinPretty[];
        contract: string;
        msg: object;
      }
    | {
        type: "evmTx";
        chainId: string;
        to: string;
        value: string;
        data: string;
        requiredErc20Approvals?: {
          amount: string;
          spender: string;
          tokenAddress: string;
        }[];
      }
    | {
        type: "MsgCCTP";
        msgs: {
          msg: string;
          msg_type_url: string;
        }[];
      }
    | undefined {
    if (!this.response) {
      throw new Error("Response is empty");
    }

    if (this.response.data.msgs.length === 0) {
      throw new Error("Msgs is empty");
    }

    if (this.response.data.msgs.length >= 2) {
      throw new Error("Msgs is too many");
    }

    const msg = this.msg;
    if (!msg) {
      throw new Error("Can't calculate msg");
    }

    return msg;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: MsgsDirectResponse }> {
    const _result = await simpleFetch<MsgsDirectResponse>(
      this.baseURL,
      this.url,
      {
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
          source_asset_denom: this.amountInDenom.replace("erc20:", ""),
          source_asset_chain_id: this.sourceAssetChainId.replace("eip155:", ""),
          dest_asset_denom: this.destAssetDenom.replace("erc20:", ""),
          dest_asset_chain_id: this.destAssetChainId.replace("eip155:", ""),
          amount_in: this.amountInAmount,
          chain_ids_to_addresses: this.chainIdsToAddresses,
          slippage_tolerance_percent: this.slippageTolerancePercent.toString(),
          affiliates:
            this.affiliateFeeBps > 0 && this.affiliateFeeReceivers.length > 0
              ? this.affiliateFeeReceivers.map((receiver) => ({
                  basis_points_fee: this.affiliateFeeBps.toString(),
                  address: receiver.address,
                }))
              : [],
          swap_venues: this.swapVenues
            .map((swapVenue) => ({
              name: swapVenue.name,
              chain_id: swapVenue.chainId.replace("eip155:", ""),
            }))
            // 임시로 추가된 swap venue는 제외
            .filter((swapVenue) => !swapVenue.name.startsWith("temp-")),
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
        }),
        signal: abortController.signal,
      }
    );
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = Schema.validate(result.data);
    if (validated.error) {
      console.log("Failed to validate msgs direct response", validated.error);
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      amountInDenom: this.amountInDenom,
      amountInAmount: this.amountInAmount,
      sourceAssetChainId: this.sourceAssetChainId,
      destAssetDenom: this.destAssetDenom,
      destAssetChainId: this.destAssetChainId,
      chainIdsToAddresses: this.chainIdsToAddresses,
      slippageTolerancePercent: this.slippageTolerancePercent,
      affiliateFeeBps: this.affiliateFeeBps,
      affiliateFeeReceivers: this.affiliateFeeReceivers,
      swap_venues: this.swapVenues,
      smartSwapOptions: this.smartSwapOptions,
    })}`;
  }
}

export class ObservableQueryMsgsDirect extends HasMapStore<ObservableQueryMsgsDirectInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly skipURL: string
  ) {
    super((str) => {
      const parsed = JSON.parse(str);
      return new ObservableQueryMsgsDirectInner(
        this.sharedContext,
        this.chainGetter,
        this.skipURL,
        parsed.amountInDenom,
        parsed.amountInAmount,
        parsed.sourceAssetChainId,
        parsed.destAssetDenom,
        parsed.destAssetChainId,
        parsed.chainIdsToAddresses,
        parsed.slippageTolerancePercent,
        parsed.affiliateFeeBps,
        parsed.affiliateFeeReceivers,
        parsed.swapVenues,
        parsed.smartSwapOptions
      );
    });
  }

  getMsgsDirect(
    amountIn: CoinPretty,
    sourceAssetChainId: string,
    destAssetDenom: string,
    destAssetChainId: string,
    chainIdsToAddresses: Record<string, string>,
    slippageTolerancePercent: number,
    affiliateFeeBps: number,
    affiliateFeeReceivers: {
      chainId: string;
      address: string;
    }[],
    swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[],
    smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ): ObservableQueryMsgsDirectInner {
    const amountInCoin = amountIn.toCoin();
    const str = JSON.stringify({
      amountInDenom: amountInCoin.denom,
      amountInAmount: amountInCoin.amount,
      sourceAssetChainId,
      destAssetDenom,
      destAssetChainId,
      chainIdsToAddresses,
      slippageTolerancePercent,
      affiliateFeeBps,
      affiliateFeeReceivers,
      swapVenues,
      smartSwapOptions,
    });
    return this.get(str);
  }
}
