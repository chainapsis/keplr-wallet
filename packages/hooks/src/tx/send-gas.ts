import { GasConfig } from "./gas";
import { DenomHelper } from "@keplr-wallet/common";
import { ChainGetter } from "@keplr-wallet/stores";
import { IAmountConfig } from "./types";
import { useState } from "react";
import { computed, makeObservable, override } from "mobx";
import { AccountStore } from "./send-types";
import { UnknownCurrencyError } from "./errors";

export class SendGasConfig extends GasConfig {
  constructor(
    chainGetter: ChainGetter,
    protected readonly accountStore: AccountStore,
    initialChainId: string,
    protected readonly amountConfig: IAmountConfig
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @override
  get gas(): number {
    // If gas not set manually, assume that the tx is for MsgSend.
    // And, set the default gas according to the currency type.
    if (this._gasRaw == null && this.amountConfig.sendCurrency) {
      const denomHelper = new DenomHelper(
        this.amountConfig.sendCurrency.coinMinimalDenom
      );

      const account = this.accountStore.getAccount(this.chainId);

      switch (denomHelper.type) {
        case "secret20":
          return account.secret?.msgOpts.send.secret20.gas ?? 0;
        case "cw20":
          return account.cosmwasm?.msgOpts.send.cw20.gas ?? 0;
        default:
          return account.cosmos?.msgOpts.send.native.gas ?? 0;
      }
    }

    return super.gas;
  }

  @computed
  get error(): Error | undefined {
    if (this.amountConfig.sendCurrency) {
      const denomHelper = new DenomHelper(
        this.amountConfig.sendCurrency.coinMinimalDenom
      );

      const account = this.accountStore.getAccount(this.chainId);

      switch (denomHelper.type) {
        case "secret20": {
          if (!account.secret?.msgOpts.send.secret20.gas) {
            return new UnknownCurrencyError("Unknown currency");
          }
          break;
        }
        case "cw20": {
          if (!account.cosmwasm?.msgOpts.send.cw20.gas) {
            return new UnknownCurrencyError("Unknown currency");
          }
          break;
        }
        default: {
          if (!account.cosmos?.msgOpts.send.native.gas) {
            return new UnknownCurrencyError("Unknown currency");
          }
        }
      }
    }

    return super.error;
  }
}

export const useSendGasConfig = (
  chainGetter: ChainGetter,
  accountStore: AccountStore,
  chainId: string,
  amountConfig: IAmountConfig
) => {
  const [gasConfig] = useState(
    () => new SendGasConfig(chainGetter, accountStore, chainId, amountConfig)
  );
  gasConfig.setChain(chainId);

  return gasConfig;
};
