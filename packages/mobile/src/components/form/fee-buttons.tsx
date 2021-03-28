import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { ButtonGroup, Text, useTheme } from "react-native-elements";
import { View, StyleSheet } from "react-native";

export interface FeeButtonsProps {
  feeConfig: IFeeConfig;
  priceStore: CoinGeckoPriceStore;
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  ({ feeConfig, priceStore }) => {
    const { theme } = useTheme();

    useEffect(() => {
      if (feeConfig.feeCurrency && !feeConfig.fee) {
        feeConfig.setFeeType("average");
      }
    }, [feeConfig, feeConfig.feeCurrency, feeConfig.fee]);

    const lowFee = feeConfig.getFeeTypePretty("low");
    const lowFeePrice = priceStore.calculatePrice("usd", lowFee);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice("usd", averageFee);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice("usd", highFee);

    let isFeeLoading = false;

    const error = feeConfig.getError();
    const errorText: string | undefined = (() => {
      if (error) {
        switch (error.constructor) {
          case InsufficientFeeError:
            return "Insufficient fee";
          case NotLoadedFeeError:
            isFeeLoading = true;
            return undefined;
          default:
            return "Unknown error";
        }
      }
    })();

    const renderFeeButton = (
      label: string,
      fee: string,
      price: string | undefined
    ) => {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>{label}</Text>
          {price ? <Text>{price}</Text> : null}
          <Text>{fee}</Text>
        </View>
      );
    };

    const selectedIndex = (() => {
      switch (feeConfig.feeType) {
        case "low":
          return 0;
        case "average":
          return 1;
        case "high":
          return 2;
        default:
          return undefined;
      }
    })();

    return (
      <React.Fragment>
        <ButtonGroup
          containerStyle={{
            height: 70,
          }}
          selectedIndex={selectedIndex}
          onPress={(i) => {
            switch (i) {
              case 0:
                feeConfig.setFeeType("low");
                break;
              case 1:
                feeConfig.setFeeType("average");
                break;
              case 2:
                feeConfig.setFeeType("high");
                break;
            }
          }}
          buttons={[
            renderFeeButton(
              "Low",
              lowFee.trim(true).toString(),
              lowFeePrice?.toString()
            ),
            renderFeeButton(
              "Average",
              averageFee.trim(true).toString(),
              averageFeePrice?.toString()
            ),
            renderFeeButton(
              "High",
              highFee.trim(true).toString(),
              highFeePrice?.toString()
            ),
          ]}
        />
        {errorText ? (
          <Text
            style={StyleSheet.flatten([
              {
                margin: 5,
                fontSize: 12,
                color: theme.colors?.error,
              },
            ])}
          >
            {errorText}
          </Text>
        ) : null}
        {isFeeLoading ? (
          <Text
            style={StyleSheet.flatten([
              {
                margin: 5,
                fontSize: 12,
                color: theme.colors?.error,
              },
            ])}
          >
            Loading...
          </Text>
        ) : null}
      </React.Fragment>
    );
  }
);
