import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { MsgsDirectResponse } from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
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
    public readonly affiliateFeeReceiver: string,
    public readonly swapVenues: {
      readonly name: string;
      readonly chainId: string;
    }[],
    public readonly smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ) {
    super(sharedContext, skipURL, "/v2/fungible/msgs_direct");

    makeObservable(this);
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
            this.affiliateFeeBps > 0 && this.affiliateFeeReceiver
              ? [
                  {
                    basis_points_fee: this.affiliateFeeBps.toString(),
                    address: this.affiliateFeeReceiver,
                  },
                ]
              : [],
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
      affiliateFeeReceiver: this.affiliateFeeReceiver,
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
        parsed.affiliateFeeReceiver,
        parsed.swapVenues,
        parsed.smartSwapOptions
      );
    });
  }

  getRoute(
    amountIn: CoinPretty,
    sourceAssetChainId: string,
    destAssetDenom: string,
    destAssetChainId: string,
    chainIdsToAddresses: Record<string, string>,
    slippageTolerancePercent: number,
    affiliateFeeBps: number,
    affiliateFeeReceiver: string | undefined,
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
      affiliateFeeReceiver,
      swapVenues,
      smartSwapOptions,
    });
    return this.get(str);
  }
}
