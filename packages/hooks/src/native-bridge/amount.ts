import { AmountConfig, IFeeConfig } from "../tx";
import { ChainGetter } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { useState } from "react";
import { QueriesStore } from "../tx/internal";
import { BridgeAmountError } from "./errors";

export class nativeBridgeAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    protected override readonly queriesStore: QueriesStore,
    initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);

    makeObservable(this);
  }

  @computed
  override get sendableCurrencies(): AppCurrency[] {
    // Only native currencies can be sent by IBC transfer.
    return super.sendableCurrencies.filter((cur) => cur.coinDenom === "FET");
  }

  override get error(): Error | undefined {
    if (super.error) {
      return super.error;
    }

    let numAmount = new Dec(this.amount);
    numAmount = numAmount.mul(
      DecUtils.getTenExponentNInPrecisionRange(this.sendCurrency.coinDecimals)
    );

    const queryEvmBridge = this.queriesStore.get(this.chainId).evm
      ?.queryNativeFetBridge;
    const queryFetchBridge = this.queriesStore.get(this.chainId).cosmwasm
      ?.queryNativeFetBridge;

    const ethBridgeStatus = queryEvmBridge?.status;
    const nativeBridgeStatus = queryFetchBridge?.status;
    if (
      !ethBridgeStatus ||
      !nativeBridgeStatus ||
      queryEvmBridge.error ||
      queryFetchBridge.error
    ) {
      return new Error("Could not fetch bridge data, try later");
    }

    const isEvm =
      this.chainGetter.getChain(this.chainId).features?.includes("evm") ??
      false;
    const chainBridgeStatus = isEvm ? ethBridgeStatus : nativeBridgeStatus;
    const destChainBridgeStatus = isEvm ? nativeBridgeStatus : ethBridgeStatus;

    let validationAmountText = "";
    const nextSupply = new Dec(chainBridgeStatus.supply).add(numAmount);

    if (numAmount.lt(new Dec(chainBridgeStatus.swapMin))) {
      validationAmountText = `Amount too small. Min: ${new Dec(
        chainBridgeStatus.swapMin
      )
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            this.sendCurrency.coinDecimals
          )
        )
        .truncate()
        .toString()} FET`;
    } else if (numAmount.gt(new Dec(chainBridgeStatus.swapMax))) {
      validationAmountText = `Amount too large. Max: ${new Dec(
        chainBridgeStatus.swapMax
      )
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            this.sendCurrency.coinDecimals
          )
        )
        .truncate()
        .toString()} FET`;
    } else if (numAmount.gt(new Dec(destChainBridgeStatus.swapMax))) {
      validationAmountText = `Amount too large. Max: ${new Dec(
        destChainBridgeStatus.swapMax
      )
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            this.sendCurrency.coinDecimals
          )
        )
        .truncate()
        .toString()} FET`;
    } else if (nextSupply.gt(new Dec(chainBridgeStatus.cap))) {
      if (
        new Dec(chainBridgeStatus.supply).gte(new Dec(chainBridgeStatus.cap))
      ) {
        validationAmountText = `The token bridge has reached its current cap, no further transfers possible at this time`;
      } else {
        const remaining = new Dec(chainBridgeStatus.cap).sub(
          new Dec(chainBridgeStatus.supply)
        );
        validationAmountText = `Amount would breach the bridge cap. Remaining allowance: ${remaining
          .quo(
            DecUtils.getTenExponentNInPrecisionRange(
              this.sendCurrency.coinDecimals
            )
          )
          .truncate()
          .toString()} FET`;
      }
    } else if (numAmount.gt(new Dec(destChainBridgeStatus.reverseAggLimit))) {
      validationAmountText = `Amount is larger than the current bridge limit. Remaining allowance ${new Dec(
        destChainBridgeStatus.reverseAggLimit
      )
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            this.sendCurrency.coinDecimals
          )
        )
        .truncate()
        .toString()}`;
    } else if (numAmount.gt(new Dec(destChainBridgeStatus.supply))) {
      validationAmountText = `Amount is larger than the current bridge supply. Remaining amount ${new Dec(
        destChainBridgeStatus.supply
      )
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            this.sendCurrency.coinDecimals
          )
        )
        .truncate()
        .toString()}`;
    }

    if (validationAmountText !== "") {
      return new BridgeAmountError(validationAmountText);
    }
  }
}

export const useNativeBridgeAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string
) => {
  const [txConfig] = useState(
    () =>
      new nativeBridgeAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        sender,
        undefined
      )
  );
  txConfig.setChain(chainId);
  txConfig.setSender(sender);
  txConfig.setSendCurrency(txConfig.sendableCurrencies[0]);

  return txConfig;
};
