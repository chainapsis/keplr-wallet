import {
  IBaseAmountConfig,
  ISenderConfig,
  TxChainSetter,
  UIProperties,
} from "../tx";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import { SignDocHelper } from "./index";
import { useState } from "react";
import { Msg } from "@keplr-wallet/types";
import { AnyWithUnpacked, UnknownMessage } from "@keplr-wallet/cosmos";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { MsgDelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { MsgTransfer } from "@keplr-wallet/proto-types/ibc/applications/transfer/v1/tx";

// This config helps the fee config to calculate that the fee is enough to send with considering
// the amount in the sign doc.
// This sets the amount as the sum of the messages in the sign doc if the message is known and can be parsed.
export class SignDocAmountConfig
  extends TxChainSetter
  implements IBaseAmountConfig
{
  @observable.ref
  protected signDocHelper?: SignDocHelper = undefined;

  @observable
  protected _disableBalanceCheck: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setSignDocHelper(signDocHelper: SignDocHelper) {
    this.signDocHelper = signDocHelper;
  }

  @computed
  get amount(): CoinPretty[] {
    if (
      this.disableBalanceCheck ||
      !this.signDocHelper?.signDocWrapper ||
      this.chainGetter.getModularChainInfoImpl(this.chainId).feeCurrencies
        ?.length === 0
    ) {
      return [];
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

  protected computeAmountInAminoMsgs(msgs: readonly Msg[]): CoinPretty[] {
    const amount: CoinPretty[] = [];

    for (const msg of msgs) {
      const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
        this.chainId
      );

      try {
        // TODO: msg.type이 다른 체인들이 몇개 있다. 이런 얘들에 대해서 좀 더 편리하게 처리해줄 방법을 찾아본다.
        //       이 기능이 사용자의 자산을 잃게 만들리는 없기 때문에 나중에 처리해준다.
        switch (msg.type) {
          case "cosmos-sdk/MsgSend":
            if (
              msg.value.from_address &&
              msg.value.from_address === this.senderConfig.sender
            ) {
              if (msg.value.amount && Array.isArray(msg.value.amount)) {
                for (const amountInMsg of msg.value.amount) {
                  amount.push(
                    new CoinPretty(
                      modularChainInfoImpl.forceFindCurrency(amountInMsg.denom),
                      amountInMsg.amount
                    )
                  );
                }
              }
            }
            break;
          case "cosmos-sdk/MsgDelegate":
            if (
              msg.value.delegator_address &&
              msg.value.delegator_address === this.senderConfig.sender
            ) {
              if (
                msg.value.amount &&
                msg.value.amount.amount &&
                msg.value.amount.denom
              ) {
                amount.push(
                  new CoinPretty(
                    modularChainInfoImpl.forceFindCurrency(
                      msg.value.amount.denom
                    ),
                    msg.value.amount.amount
                  )
                );
              }
            }
            break;
          case "cosmos-sdk/MsgTransfer": {
            if (
              msg.value.sender &&
              msg.value.sender === this.senderConfig.sender
            ) {
              if (
                msg.value.token &&
                msg.value.token.amount &&
                msg.value.token.denom
              ) {
                amount.push(
                  new CoinPretty(
                    modularChainInfoImpl.forceFindCurrency(
                      msg.value.token.denom
                    ),
                    msg.value.token.amount
                  )
                );
              }
            }
            break;
          }
        }
      } catch (e) {
        console.log(
          `Error on the parsing the msg: ${e.message || e.toString()}`
        );
      }
    }

    return this.mergeDuplicatedAmount(amount);
  }

  protected computeAmountInProtoMsgs(msgs: AnyWithUnpacked[]) {
    const amount: CoinPretty[] = [];

    for (const msg of msgs) {
      const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
        this.chainId
      );

      try {
        if (!(msg instanceof UnknownMessage) && "unpacked" in msg) {
          switch (msg.typeUrl) {
            case "/cosmos.bank.v1beta1.MsgSend": {
              const sendMsg = msg.unpacked as MsgSend;
              if (
                sendMsg.fromAddress &&
                sendMsg.fromAddress === this.senderConfig.sender
              ) {
                for (const amountInMsg of sendMsg.amount) {
                  amount.push(
                    new CoinPretty(
                      modularChainInfoImpl.forceFindCurrency(amountInMsg.denom),
                      amountInMsg.amount
                    )
                  );
                }
              }
              break;
            }
            case "/cosmos.staking.v1beta1.MsgDelegate": {
              const delegateMsg = msg.unpacked as MsgDelegate;
              if (
                delegateMsg.delegatorAddress &&
                delegateMsg.delegatorAddress === this.senderConfig.sender
              ) {
                if (delegateMsg.amount) {
                  amount.push(
                    new CoinPretty(
                      modularChainInfoImpl.forceFindCurrency(
                        delegateMsg.amount.denom
                      ),
                      delegateMsg.amount.amount
                    )
                  );
                }
              }
              break;
            }
            case "/ibc.applications.transfer.v1.MsgTransfer": {
              const ibcTransferMsg = msg.unpacked as MsgTransfer;
              if (
                ibcTransferMsg.sender &&
                ibcTransferMsg.sender === this.senderConfig.sender
              ) {
                if (ibcTransferMsg.token) {
                  amount.push(
                    new CoinPretty(
                      modularChainInfoImpl.forceFindCurrency(
                        ibcTransferMsg.token.denom
                      ),
                      ibcTransferMsg.token.amount
                    )
                  );
                }
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

    return this.mergeDuplicatedAmount(amount);
  }

  protected mergeDuplicatedAmount(amount: CoinPretty[]): CoinPretty[] {
    const mergedMap = new Map<string, CoinPretty>();

    for (const amt of amount) {
      let merged = mergedMap.get(amt.currency.coinMinimalDenom);
      if (!merged) {
        merged = amt;
        mergedMap.set(amt.currency.coinMinimalDenom, merged);
      } else {
        merged = merged.add(amt);
        mergedMap.set(amt.currency.coinMinimalDenom, merged);
      }
    }

    return Array.from(mergedMap.values());
  }

  @computed
  get uiProperties(): UIProperties {
    return {};
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
  chainId: string,
  senderConfig: ISenderConfig
) => {
  const [config] = useState(
    () => new SignDocAmountConfig(chainGetter, chainId, senderConfig)
  );
  config.setChain(chainId);

  return config;
};
