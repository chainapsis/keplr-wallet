import { IAmountConfig } from "../tx";
import { TxChainSetter } from "../tx/chain";
import {
  ChainGetter,
  CoinPrimitive,
  CosmosMsgOpts,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { action, computed, makeObservable, observable } from "mobx";
import { Coin, CoinPretty, Int } from "@keplr-wallet/unit";
import { SignDocHelper } from "./index";
import { useState } from "react";
import { computedFn } from "mobx-utils";
import { Msg } from "@cosmjs/launchpad";
import { cosmos } from "@keplr-wallet/cosmos";

// This config helps the fee config to calculate that the fee is enough to send with considering
// the amount in the sign doc.
// This sets the amount as the sum of the messages in the sign doc if the message is known and can be parsed.
export class SignDocAmountConfig
  extends TxChainSetter
  implements IAmountConfig {
  @observable.ref
  protected msgOpts: CosmosMsgOpts;

  @observable.ref
  protected signDocHelper?: SignDocHelper = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    msgOpts: CosmosMsgOpts
  ) {
    super(chainGetter, initialChainId);

    this.msgOpts = msgOpts;

    makeObservable(this);
  }

  @action
  setMsgOpts(opts: CosmosMsgOpts) {
    this.msgOpts = opts;
  }

  @action
  setSignDocHelper(signDocHelper: SignDocHelper) {
    this.signDocHelper = signDocHelper;
  }

  @computed
  get amount(): string {
    const primitive = this.getAmountPrimitive();

    return new CoinPretty(
      this.sendCurrency,
      new Int(primitive.amount)
    ).toString();
  }

  get sendCurrency(): AppCurrency {
    const chainInfo = this.chainInfo;
    if (chainInfo.feeCurrencies.length > 0) {
      return chainInfo.feeCurrencies[0];
    }

    return chainInfo.currencies[0];
  }

  get sendableCurrencies(): AppCurrency[] {
    return [this.sendCurrency];
  }

  get sender(): string {
    return "";
  }

  getAmountPrimitive = computedFn(
    (): CoinPrimitive => {
      if (
        !this.signDocHelper?.signDocWrapper ||
        this.chainInfo.feeCurrencies.length === 0
      ) {
        return {
          amount: "0",
          denom: this.sendCurrency.coinMinimalDenom,
        };
      }

      if (this.signDocHelper.signDocWrapper.mode === "amino") {
        return this.computeAmountInAminoMsgs(
          this.signDocHelper.signDocWrapper.aminoSignDoc.msgs
        );
      } else {
        return this.computeAmountInProtoMsgs(
          this.signDocHelper.signDocWrapper.protoSignDoc.txMsgs
        );
      }
    }
  );

  protected computeAmountInAminoMsgs(msgs: readonly Msg[]) {
    const amount = new Coin(this.sendCurrency.coinMinimalDenom, new Int(0));

    for (const msg of msgs) {
      try {
        switch (msg.type) {
          case this.msgOpts.send.native.type:
            if (msg.value.amount && Array.isArray(msg.value.amount)) {
              for (const amountInMsg of msg.value.amount) {
                if (amountInMsg.denom === amount.denom) {
                  amount.amount = amount.amount.add(
                    new Int(amountInMsg.amount)
                  );
                }
              }
            }
            break;
          case this.msgOpts.delegate.type:
            if (msg.value.amount && msg.value.amount.denom === amount.denom) {
              amount.amount = amount.amount.add(
                new Int(msg.value.amount.amount)
              );
            }
            break;
        }
      } catch (e) {
        console.log(
          `Error on the parsing the msg: ${e.message || e.toString()}`
        );
      }
    }

    return {
      amount: amount.amount.toString(),
      denom: amount.denom,
    };
  }

  protected computeAmountInProtoMsgs(msgs: any[]) {
    const amount = new Coin(this.sendCurrency.coinMinimalDenom, new Int(0));

    for (const msg of msgs) {
      try {
        switch (msg.constructor) {
          case cosmos.bank.v1beta1.MsgSend:
            const sendMsg = msg as cosmos.bank.v1beta1.MsgSend;
            for (const amountInMsg of sendMsg.amount) {
              if (amountInMsg.denom === amount.denom && amountInMsg.amount) {
                amount.amount = amount.amount.add(new Int(amountInMsg.amount));
              }
            }
            break;
          case cosmos.staking.v1beta1.MsgDelegate:
            const delegateMsg = msg as cosmos.staking.v1beta1.MsgDelegate;
            if (
              delegateMsg.amount?.denom === amount.denom &&
              delegateMsg.amount.amount
            ) {
              amount.amount = amount.amount.add(
                new Int(delegateMsg.amount.amount)
              );
            }
            break;
        }
      } catch (e) {
        console.log(
          `Error on the parsing the msg: ${e.message || e.toString()}`
        );
      }
    }

    return {
      amount: amount.amount.toString(),
      denom: amount.denom,
    };
  }

  getError(): Error | undefined {
    return undefined;
  }

  setIsMax(_: boolean): void {
    // noop
  }
  toggleIsMax(): void {
    // noop
  }

  get isMax(): boolean {
    // noop
    return false;
  }

  setAmount(): void {
    // noop
  }

  setSendCurrency(): void {
    // noop
  }

  setSender(): void {
    // noop
  }
}

export const useSignDocAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  msgOpts: CosmosMsgOpts
) => {
  const [config] = useState(
    () => new SignDocAmountConfig(chainGetter, chainId, msgOpts)
  );
  config.setChain(chainId);
  config.setMsgOpts(msgOpts);

  return config;
};
