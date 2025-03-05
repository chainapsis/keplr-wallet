import { AccountSetBase, AccountSetBaseSuper } from "./base";
import {
  QueriesSetBase,
  IQueriesStore,
  CosmosQueries,
  NobleQueries,
} from "../query";
import { ChainGetter } from "../chain";
import { Currency } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { CosmosAccount } from "./cosmos";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { MsgSwap } from "@keplr-wallet/proto-types/noble/swap/v1/tx";
import { MsgClaimYield } from "@keplr-wallet/proto-types/noble/dollar/v1/tx";

export interface NobleAccount {
  noble: NobleAccountImpl;
}

export const NobleAccount = {
  use(options: {
    queriesStore: IQueriesStore<CosmosQueries & NobleQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => NobleAccount {
    return (base, chainGetter, chainId) => {
      return {
        noble: new NobleAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
      };
    };
  },
};

export class NobleAccountImpl {
  constructor(
    protected readonly base: AccountSetBase & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<CosmosQueries & NobleQueries>
  ) {}

  makeSwapTx(
    // This arg can be used to override the type of sending tx if needed.
    type: string = "noble-swap",
    amount: string,
    currency: Currency,
    minOutAmount: string,
    outCurrency: Currency,
    routes: {
      poolId: string;
      denomTo: string;
    }[]
  ) {
    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();
    const actualMinOutAmount = (() => {
      let dec = new Dec(minOutAmount);
      dec = dec.mul(DecUtils.getPrecisionDec(outCurrency.coinDecimals));
      return dec.truncate().toString();
    })();

    const msg = {
      type: "swap/Swap",
      value: {
        signer: this.base.bech32Address,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: actualAmount,
        },
        routes: routes.map((route) => {
          return {
            pool_id: route.poolId,
            denom_to: route.denomTo,
          };
        }),
        min: {
          denom: outCurrency.coinMinimalDenom,
          amount: actualMinOutAmount,
        },
      },
    };

    return this.base.cosmos.makeTx(
      type,
      {
        aminoMsgs: [
          {
            type: msg.type,
            value: {
              ...msg.value,
              routes: msg.value.routes.map((route) => {
                if (route.pool_id === "0") {
                  // pool id가 0일 경우 omit empty에 의해서 아예 field를 없애야한다.
                  return {
                    denom_to: route.denom_to,
                  };
                }

                return {
                  pool_id: route.pool_id,
                  denom_to: route.denom_to,
                };
              }),
            },
          },
        ],
        protoMsgs: [
          {
            typeUrl: "/noble.swap.v1.MsgSwap",
            value: MsgSwap.encode(
              MsgSwap.fromPartial({
                signer: msg.value.signer,
                amount: msg.value.amount,
                routes: msg.value.routes.map((route) => {
                  return {
                    poolId: route.pool_id,
                    denomTo: route.denom_to,
                  };
                }),
                min: msg.value.min,
              })
            ).finish(),
          },
        ],
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          const bals = this.queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.filter(
              (bal) =>
                bal.currency.coinMinimalDenom === currency.coinMinimalDenom ||
                bal.currency.coinMinimalDenom === outCurrency.coinMinimalDenom
            );

          for (const bal of bals) {
            bal.fetch();
          }
        }
      }
    );
  }

  makeClaimYieldTx(
    // This arg can be used to override the type of sending tx if needed.
    type: string = "noble-claim-yield"
  ) {
    const msg = {
      type: "dollar/ClaimYield",
      value: {
        signer: this.base.bech32Address,
      },
    };

    return this.base.cosmos.makeTx(
      type,
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/noble.dollar.v1.MsgClaimYield",
            value: MsgClaimYield.encode(
              MsgClaimYield.fromPartial({
                signer: msg.value.signer,
              })
            ).finish(),
          },
        ],
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.noble.queryYield
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }
      }
    );
  }

  protected get queries(): DeepReadonly<
    QueriesSetBase & CosmosQueries & NobleQueries
  > {
    return this.queriesStore.get(this.chainId);
  }
}
