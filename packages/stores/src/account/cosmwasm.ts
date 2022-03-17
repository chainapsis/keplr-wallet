import { AccountSetBase, AccountSetBaseSuper, MsgOpt } from "./base";
import { CosmwasmQueries, IQueriesStore, QueriesSetBase } from "../query";
import { ChainGetter, CoinPrimitive } from "../common";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { AppCurrency, KeplrSignOptions } from "@keplr-wallet/types";
import { DeepPartial, DeepReadonly, Optional } from "utility-types";
import { cosmwasm } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import deepmerge from "deepmerge";
import { CosmosAccount } from "./cosmos";

export interface CosmwasmAccount {
  cosmwasm: CosmwasmAccountImpl;
}

export const CosmwasmAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<CosmwasmMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmwasmQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmwasmAccount {
    return (base, chainGetter, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        cosmwasm: new CosmwasmAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
          deepmerge<CosmwasmMsgOpts, DeepPartial<CosmwasmMsgOpts>>(
            defaultCosmwasmMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          )
        ),
      };
    };
  },
};

export interface CosmwasmMsgOpts {
  readonly send: {
    readonly cw20: Pick<MsgOpt, "gas">;
  };

  readonly executeWasm: Pick<MsgOpt, "type">;
}

export const defaultCosmwasmMsgOpts: CosmwasmMsgOpts = {
  send: {
    cw20: {
      gas: 150000,
    },
  },

  executeWasm: {
    type: "wasm/MsgExecuteContract",
  },
};

export class CosmwasmAccountImpl {
  constructor(
    protected readonly base: AccountSetBase & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<CosmwasmQueries>,
    protected readonly msgOpts: CosmwasmMsgOpts
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  protected async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    switch (denomHelper.type) {
      case "cw20":
        const actualAmount = (() => {
          let dec = new Dec(amount);
          dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
          return dec.truncate().toString();
        })();

        if (!("type" in currency) || currency.type !== "cw20") {
          throw new Error("Currency is not cw20");
        }
        await this.sendExecuteContractMsg(
          "send",
          currency.contractAddress,
          {
            transfer: {
              recipient: recipient,
              amount: actualAmount,
            },
          },
          [],
          memo,
          {
            amount: stdFee.amount ?? [],
            gas: stdFee.gas ?? this.msgOpts.send.cw20.gas.toString(),
          },
          signOptions,
          this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
            if (tx.code == null || tx.code === 0) {
              // After succeeding to send token, refresh the balance.
              const queryBalance = this.queries.queryBalances
                .getQueryBech32Address(this.base.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }
            }
          })
        );
        return true;
    }

    return false;
  }

  async sendExecuteContractMsg(
    // This arg can be used to override the type of sending tx if needed.
    type: keyof CosmwasmMsgOpts | "unknown" = "executeWasm",
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object,
    funds: CoinPrimitive[],
    memo: string = "",
    stdFee: Optional<StdFee, "amount">,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<void> {
    const msg = {
      type: this.msgOpts.executeWasm.type,
      value: {
        sender: this.base.bech32Address,
        contract: contractAddress,
        msg: obj,
        funds,
      },
    };

    await this.base.cosmos.sendMsgs(
      type,
      {
        aminoMsgs: [msg],
        protoMsgs: this.hasNoLegacyStdFeature()
          ? [
              {
                type_url: "/cosmwasm.wasm.v1.MsgExecuteContract",
                value: cosmwasm.wasm.v1.MsgExecuteContract.encode({
                  sender: msg.value.sender,
                  contract: msg.value.contract,
                  msg: Buffer.from(JSON.stringify(msg.value.msg)),
                  funds: msg.value.funds,
                }).finish(),
              },
            ]
          : undefined,
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas,
      },
      signOptions,
      this.txEventsWithPreOnFulfill(onTxEvents)
    );
  }

  protected txEventsWithPreOnFulfill(
    onTxEvents:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
      | undefined,
    preOnFulfill?: (tx: any) => void
  ):
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: any) => void;
      }
    | undefined {
    if (!onTxEvents) {
      return;
    }

    const onBroadcasted =
      typeof onTxEvents === "function" ? undefined : onTxEvents.onBroadcasted;
    const onFulfill =
      typeof onTxEvents === "function" ? onTxEvents : onTxEvents.onFulfill;

    return {
      onBroadcasted,
      onFulfill: onFulfill
        ? (tx: any) => {
            if (preOnFulfill) {
              preOnFulfill(tx);
            }

            onFulfill(tx);
          }
        : undefined,
    };
  }

  protected get queries(): DeepReadonly<QueriesSetBase & CosmwasmQueries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes("no-legacy-stdTx")
    );
  }
}
