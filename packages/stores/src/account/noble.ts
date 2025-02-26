import { AccountSetBase, AccountSetBaseSuper } from "./base";
import { QueriesSetBase, IQueriesStore, CosmosQueries } from "../query";
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
    queriesStore: IQueriesStore<CosmosQueries>;
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
    protected readonly queriesStore: IQueriesStore<CosmosQueries>
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
    }[],
    preOnTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
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
        // XXX: It needs to add aminoMsgs when this message supports amino.
        // aminoMsgs: [msg],
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
      preOnTxEvents
    );
  }

  makeClaimYieldTx(
    // This arg can be used to override the type of sending tx if needed.
    type: string = "noble-claim-yield",
    preOnTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
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
        // XXX: It needs to add aminoMsgs when this message supports amino.
        // aminoMsgs: [msg],
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
      preOnTxEvents
    );
  }

  protected get queries(): DeepReadonly<QueriesSetBase & CosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
