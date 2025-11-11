import { AmountConfig, ISenderConfig } from "../tx";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { action, makeObservable, observable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { useState } from "react";
import { IIBCChannelConfig } from "./types";

export class IBCAmountConfig extends AmountConfig {
  @observable
  protected isIBCTransfer: boolean = false;

  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    initialChainId: string,
    senderConfig: ISenderConfig,
    protected readonly channelConfig: IIBCChannelConfig,
    disableSubFeeFromFaction: boolean,
    isIBCTransfer: boolean
  ) {
    super(
      chainGetter,
      queriesStore,
      initialChainId,
      senderConfig,
      disableSubFeeFromFaction
    );
    this.isIBCTransfer = isIBCTransfer;

    makeObservable(this);
  }

  override canUseCurrency(currency: AppCurrency): boolean {
    if (!this.isIBCTransfer) {
      return super.canUseCurrency(currency);
    }

    // Only native currencies can be sent by IBC transfer.
    return new DenomHelper(currency.coinMinimalDenom).type === "native";
  }

  @action
  setIsIBCTransfer(isIBCTransfer: boolean) {
    this.isIBCTransfer = isIBCTransfer;
  }
}

export const useIBCAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  senderConfig: ISenderConfig,
  channelConfig: IIBCChannelConfig,
  disableSubFeeFromFaction: boolean,
  isIBCTransfer: boolean
) => {
  const [txConfig] = useState(
    () =>
      new IBCAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        senderConfig,
        channelConfig,
        disableSubFeeFromFaction,
        isIBCTransfer
      )
  );
  txConfig.setChain(chainId);
  txConfig.setIsIBCTransfer(isIBCTransfer);
  txConfig.setDisableSubFeeFromFaction(disableSubFeeFromFaction);

  return txConfig;
};
