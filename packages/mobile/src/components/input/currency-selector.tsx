import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { TextStyle, ViewStyle } from "react-native";
import { Selector } from "./selector";

export const CurrencySelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;

  label: string;
  placeHolder?: string;

  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    selectorContainerStyle,
    textStyle,
    label,
    placeHolder,
    amountConfig,
  }) => {
    const items = amountConfig.sendableCurrencies.map((currency) => {
      return {
        key: currency.coinMinimalDenom,
        label: currency.coinDenom,
      };
    });

    const selectedKey = amountConfig.sendCurrency.coinMinimalDenom;
    const setSelectedKey = (key: string | undefined) => {
      const currency = amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === key
      );
      amountConfig.setSendCurrency(currency);
    };

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
