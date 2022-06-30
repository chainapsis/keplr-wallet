import { IAmountConfig, TxChainSetter } from "../tx";
import {
  ChainGetter,
  CoinPrimitive,
  CosmosMsgOpts,
  IAccountStore,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { action, computed, makeObservable, observable } from "mobx";
import { Coin, CoinPretty, Int } from "@keplr-wallet/unit";
import { SignDocHelper } from "./index";
import { useState } from "react";
import { computedFn } from "mobx-utils";
import { Msg } from "@cosmjs/launchpad";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { MsgDelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { AnyWithUnpacked, UnknownMessage } from "@keplr-wallet/cosmos";

export type AccountStore = IAccountStore<{
  cosmos: {
    readonly msgOpts: CosmosMsgOpts;
  };
}>;

// This config helps the fee config to calculate that the fee is enough to send with considering
// the amount in the sign doc.
// This sets the amount as the sum of the messages in the sign doc if the message is known and can be parsed.
export class SignDocAmountConfig
  extends TxChainSetter
  implements IAmountConfig {
  @observable.ref
  protected signDocHelper?: SignDocHelper = undefined;

  @observable
  protected _sender: string;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    protected readonly accountStore: AccountStore,
    initialChainId: string,
    sender: string
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;

    makeObservable(this);
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

  @action
  setSender(sender: string): void {
    this._sender = sender;
  }

  get sender(): string {
    return this._sender;
  }

  getAmountPrimitive = computedFn(
    (): CoinPrimitive => {
      if (
        this.disableBalanceCheck ||
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

    const account = this.accountStore.getAccount(this.chainId);

    for (const msg of msgs) {
      try {
        switch (msg.type) {
          case account.cosmos.msgOpts.send.native.type:
            if (
              msg.value.from_address &&
              msg.value.from_address !== this.sender
            ) {
              return {
                amount: "0",
                denom: this.sendCurrency.coinMinimalDenom,
              };
            }
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
          case account.cosmos.msgOpts.delegate.type:
            if (
              msg.value.delegator_address &&
              msg.value.delegator_address !== this.sender
            ) {
              return {
                amount: "0",
                denom: this.sendCurrency.coinMinimalDenom,
              };
            }
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

  protected computeAmountInProtoMsgs(msgs: AnyWithUnpacked[]) {
    const amount = new Coin(this.sendCurrency.coinMinimalDenom, new Int(0));

    for (const msg of msgs) {
      try {
        if (!(msg instanceof UnknownMessage) && "unpacked" in msg) {
          switch (msg.typeUrl) {
            case "/cosmos.bank.v1beta1.MsgSend": {
              const sendMsg = msg.unpacked as MsgSend;
              if (sendMsg.fromAddress && sendMsg.fromAddress !== this.sender) {
                return {
                  amount: "0",
                  denom: this.sendCurrency.coinMinimalDenom,
                };
              }
              for (const amountInMsg of sendMsg.amount) {
                if (amountInMsg.denom === amount.denom && amountInMsg.amount) {
                  amount.amount = amount.amount.add(
                    new Int(amountInMsg.amount)
                  );
                }
              }
              break;
            }
            case "/cosmos.staking.v1beta1.MsgDelegate": {
              const delegateMsg = msg.unpacked as MsgDelegate;
              if (
                delegateMsg.delegatorAddress &&
                delegateMsg.delegatorAddress !== this.sender
              ) {
                return {
                  amount: "0",
                  denom: this.sendCurrency.coinMinimalDenom,
                };
              }
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
          }
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

  get error(): Error | undefined {
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

  get fraction(): number | undefined {
    // noop
    return undefined;
  }

  setFraction(_: number | undefined) {
    // noop
  }

  setAmount(): void {
    // noop
  }

  setSendCurrency(): void {
    // noop
  }

  @action
  setDisableBalanceCheck(bool: boolean) {
    this._disableBalanceCheck = bool;
  }

  get disableBalanceCheck(): boolean {
    return this._disableBalanceCheck;
  }
}

export const useSignDocAmountConfig = (
  chainGetter: ChainGetter,
  accountStore: AccountStore,
  chainId: string,
  sender: string
) => {
  const [config] = useState(
    () => new SignDocAmountConfig(chainGetter, accountStore, chainId, sender)
  );
  config.setChain(chainId);
  config.setSender(sender);

  return config;
};
