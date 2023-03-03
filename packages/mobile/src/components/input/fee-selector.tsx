import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IFeeConfig } from "@keplr-wallet/hooks";
import { TextStyle, ViewStyle } from "react-native";
import { Selector } from "./selector";
import { useStore } from "../../stores";

export const FeeSelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;

  label: string;
  placeHolder?: string;

  feeConfig: IFeeConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    selectorContainerStyle,
    textStyle,
    label,
    placeHolder,
    feeConfig,
  }) => {
    const { queriesStore } = useStore();
    const queryBalances = queriesStore
      .get(feeConfig.chainId)
      .queryBalances.getQueryBech32Address(feeConfig.sender);

    const selectedKey = feeConfig.feeCurrency?.coinMinimalDenom;
    const setSelectedKey = (key: string | undefined) => {
      const currency = feeConfig.feeCurrencies?.find(
        (cur) => cur.coinMinimalDenom === key
      );
      feeConfig.setAutoFeeCoinMinimalDenom(currency?.coinMinimalDenom);
    };

    const firstFeeCurrencyDenom =
      feeConfig.feeCurrencies.length > 0
        ? feeConfig.feeCurrencies[0].coinMinimalDenom
        : "";

    // Show the fee currencies that account has.
    // But, always show the first fee currency to reduce the confusion to user because first fee currency has priority.
    const selectableCurrencies = feeConfig.feeCurrencies.filter((cur) => {
      if (
        firstFeeCurrencyDenom &&
        cur.coinMinimalDenom === firstFeeCurrencyDenom
      ) {
        return true;
      }

      const bal = queryBalances.getBalanceFromCurrency(cur);
      return !bal.toDec().isZero();
    });

    const items = selectableCurrencies.map((currency) => {
      return {
        key: currency.coinMinimalDenom,
        label: currency.coinDenom,
      };
    });

    return (
      <Selector
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        maxItemsToShow={4}
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
      />
    );
  }
);
