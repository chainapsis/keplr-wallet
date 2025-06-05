import { AccountSetBase, AccountSetBaseSuper } from "./base";
import {
  QueriesSetBase,
  IQueriesStore,
  CosmosQueries,
  BabylonQueries,
} from "../query";
import { ChainGetter } from "../chain";
import { DeepReadonly } from "utility-types";
import { CosmosAccount } from "./cosmos";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import {
  MsgWrappedBeginRedelegate,
  MsgWrappedDelegate,
  MsgWrappedUndelegate,
} from "@keplr-wallet/proto-types/babylon/epoching/v1/tx";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {} from "../query";

export interface BabylonAccount {
  babylon: BabylonAccountImpl;
}

export const BabylonAccount = {
  use(options: {
    queriesStore: IQueriesStore<CosmosQueries & BabylonQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
    chainGetter: ChainGetter,
    chainId: string
  ) => BabylonAccount {
    return (base, chainGetter, chainId) => {
      return {
        babylon: new BabylonAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
      };
    };
  },
};

export class BabylonAccountImpl {
  constructor(
    protected readonly base: AccountSetBase & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & BabylonQueries
    >
  ) {}

  makeDelegateTx(amount: string, validatorAddress: string) {
    Bech32Address.validate(
      validatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!currency) {
      throw new Error("Stake currency is null");
    }

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: "/babylon.epoching.v1.MsgWrappedDelegate",
      value: {
        msg: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
          amount: {
            denom: currency.coinMinimalDenom,
            amount: dec.truncate().toString(),
          },
        },
      },
    };

    return this.base.cosmos.makeTx(
      "delegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: msg.type,
            value: MsgWrappedDelegate.encode({
              msg: {
                delegatorAddress: msg.value.msg.delegator_address,
                validatorAddress: msg.value.msg.validator_address,
                amount: msg.value.msg.amount,
              },
            }).finish(),
          },
        ],
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to delegate, refresh the last epoch message list
          this.queries.babylon.queryLastEpochMsgs.getQuery().fetch();
        }
      }
    );
  }

  makeUndelegateTx(amount: string, validatorAddress: string) {
    Bech32Address.validate(
      validatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!currency) {
      throw new Error("Stake currency is null");
    }

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: "/babylon.epoching.v1.MsgWrappedUndelegate",
      value: {
        msg: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
          amount: {
            denom: currency.coinMinimalDenom,
            amount: dec.truncate().toString(),
          },
        },
      },
    };

    return this.base.cosmos.makeTx(
      "undelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: msg.type,
            value: MsgWrappedUndelegate.encode({
              msg: {
                delegatorAddress: msg.value.msg.delegator_address,
                validatorAddress: msg.value.msg.validator_address,
                amount: msg.value.msg.amount,
              },
            }).finish(),
          },
        ],
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to undelegate, refresh the last epoch message list
          this.queries.babylon.queryLastEpochMsgs.getQuery().fetch();
        }
      }
    );
  }

  makeBeginRedelegateTx(
    amount: string,
    srcValidatorAddress: string,
    dstValidatorAddress: string
  ) {
    Bech32Address.validate(
      srcValidatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );
    Bech32Address.validate(
      dstValidatorAddress,
      this.chainGetter.getChain(this.chainId).bech32Config?.bech32PrefixValAddr
    );

    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!currency) {
      throw new Error("Stake currency is null");
    }

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: "/babylon.epoching.v1.MsgWrappedBeginRedelegate",
      value: {
        msg: {
          delegator_address: this.base.bech32Address,
          validator_src_address: srcValidatorAddress,
          validator_dst_address: dstValidatorAddress,
          amount: {
            denom: currency.coinMinimalDenom,
            amount: dec.truncate().toString(),
          },
        },
      },
    };

    return this.base.cosmos.makeTx(
      "redelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: msg.type,
            value: MsgWrappedBeginRedelegate.encode({
              msg: {
                delegatorAddress: msg.value.msg.delegator_address,
                validatorSrcAddress: msg.value.msg.validator_src_address,
                validatorDstAddress: msg.value.msg.validator_dst_address,
                amount: msg.value.msg.amount,
              },
            }).finish(),
          },
        ],
      },
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to redelegate, refresh the last epoch message list
          this.queries.babylon.queryLastEpochMsgs.getQuery().fetch();
        }
      }
    );
  }

  protected get queries(): DeepReadonly<
    QueriesSetBase & CosmosQueries & BabylonQueries
  > {
    return this.queriesStore.get(this.chainId);
  }
}
