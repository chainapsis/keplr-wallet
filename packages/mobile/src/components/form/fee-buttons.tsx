import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { ButtonGroup, Text } from "react-native-elements";
import { View } from "react-native";
import {
  alignItemsCenter,
  bgcPrimary,
  bgcWhite,
  fcDefault,
  fcWhite,
  fcGrey2,
  flex1,
  subtitle2,
  justifyContentCenter,
  sf,
  mx0,
  mb0,
  shadow,
  errorStyle,
  h6,
  caption1,
  my1,
  mt2,
} from "../../styles";

export interface FeeButtonsProps {
  feeConfig: IFeeConfig;
  priceStore: CoinGeckoPriceStore;
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  ({ feeConfig, priceStore }) => {
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
      index: number,
      selectedIndex: 0 | 1 | 2 | undefined,
      label: string,
      fee: string,
      price: string | undefined
    ) => {
      const [backgroundColor, textColor, titleColor] =
        index === selectedIndex
          ? [bgcPrimary, fcWhite, fcWhite]
          : [bgcWhite, fcGrey2, fcDefault];

      return (
        <View
          style={sf([
            flex1,
            alignItemsCenter,
            justifyContentCenter,
            backgroundColor,
          ])}
        >
          <Text style={sf([mt2, h6, titleColor])}>{label}</Text>
          {price ? (
            <Text style={sf([textColor, caption1, my1])}>{price}</Text>
          ) : null}
          <Text style={sf([textColor, caption1])}>{fee}</Text>
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
        <Text style={subtitle2}>Fee</Text>
        <ButtonGroup
          containerStyle={sf([{ height: 90 }, mx0, mb0, shadow])}
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
              0,
              selectedIndex,
              "Low",
              lowFee.trim(true).toString(),
              lowFeePrice?.toString()
            ),
            renderFeeButton(
              1,
              selectedIndex,
              "Average",
              averageFee.trim(true).toString(),
              averageFeePrice?.toString()
            ),
            renderFeeButton(
              2,
              selectedIndex,
              "High",
              highFee.trim(true).toString(),
              highFeePrice?.toString()
            ),
          ]}
        />
        <Text style={errorStyle}>{errorText ? errorText : " "}</Text>
        {isFeeLoading ? <Text style={errorStyle}>Loading...</Text> : null}
      </React.Fragment>
    );
  }
);
