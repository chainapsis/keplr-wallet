import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { Text } from "react-native-elements";
import { View } from "react-native";
import {
  alignItemsCenter,
  bgcWhite,
  fcDefault,
  fcWhite,
  flex1,
  subtitle2,
  justifyContentCenter,
  sf,
  errorStyle,
  h6,
  caption1,
  my1,
  mt2,
  flexDirectionRow,
  py2,
  bgcPrimary300,
  fcLow,
} from "../../styles";
import {
  RectButton,
  gestureHandlerRootHOC,
} from "react-native-gesture-handler";

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
    const lowFeePrice = priceStore.calculatePrice(lowFee);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice(highFee);

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
      price: string | undefined,
      onPress: () => void
    ) => {
      const [backgroundColor, textColor, titleColor] =
        index === selectedIndex
          ? [bgcPrimary300, fcWhite, fcWhite]
          : [bgcWhite, fcLow, fcDefault];

      // RectButton in Modal only working in HOC on android
      const FeeButtonWithHOC = gestureHandlerRootHOC(() => (
        <RectButton style={sf([flex1, backgroundColor])} onPress={onPress}>
          <View
            accessible
            style={sf([alignItemsCenter, justifyContentCenter, py2])}
          >
            <Text style={sf([mt2, h6, titleColor])}>{label}</Text>
            {price ? (
              <Text style={sf([textColor, caption1, my1])}>{price}</Text>
            ) : null}
            <Text style={sf([textColor, caption1])}>{fee}</Text>
          </View>
        </RectButton>
      ));
      return <FeeButtonWithHOC />;
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

    const feeButtons = [
      renderFeeButton(
        0,
        selectedIndex,
        "Low",
        lowFee.trim(true).toString(),
        lowFeePrice?.toString(),
        () => {
          feeConfig.setFeeType("low");
        }
      ),
      renderFeeButton(
        1,
        selectedIndex,
        "Average",
        averageFee.trim(true).toString(),
        averageFeePrice?.toString(),
        () => {
          feeConfig.setFeeType("average");
        }
      ),
      renderFeeButton(
        2,
        selectedIndex,
        "High",
        highFee.trim(true).toString(),
        highFeePrice?.toString(),
        () => {
          feeConfig.setFeeType("high");
        }
      ),
    ];

    return (
      <React.Fragment>
        <Text style={subtitle2}>Fee</Text>
        <View style={sf([flexDirectionRow])}>
          {feeButtons.map((button) => {
            return button;
          })}
        </View>
        <Text style={errorStyle}>{errorText ? errorText : " "}</Text>
        {isFeeLoading ? <Text style={errorStyle}>Loading...</Text> : null}
      </React.Fragment>
    );
  }
);
