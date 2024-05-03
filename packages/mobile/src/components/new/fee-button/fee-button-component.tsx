import React, { FunctionComponent, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { useStyle } from "styles/index";
import { action, makeObservable, observable } from "mobx";
import {
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { GasInput } from "../../input/gas";
import { useStore } from "stores/index";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { LoadingSpinner } from "components/spinner";
import { RectButton } from "components/rect-button";
import { observer } from "mobx-react-lite";
import { BlurButton } from "../button/blur-button";

export interface FeeButtonsProps {
  labelStyle?: TextStyle;
  containerStyle?: ViewProps;
  buttonsContainerStyle?: ViewProps;
  errorLabelStyle?: TextStyle;

  label: string;
  gasLabel: string;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}

class FeeButtonState {
  @observable
  protected _isGasInputOpen: boolean = false;

  constructor() {
    makeObservable(this);
  }

  get isGasInputOpen(): boolean {
    return this._isGasInputOpen;
  }

  @action
  setIsGasInputOpen(open: boolean) {
    this._isGasInputOpen = open;
  }
}

export const FeeButtons: FunctionComponent<FeeButtonsProps> = observer(
  (props) => {
    // This may be not the good way to handle the states across the components.
    // But, rather than using the context API with boilerplate code, just use the mobx state to simplify the logic.
    const [feeButtonState] = useState(() => new FeeButtonState());
    const style = useStyle();

    return (
      <React.Fragment>
        {props.feeConfig.feeCurrency ? <FeeButtonsInner {...props} /> : null}
        <BlurButton
          text="Advanced Settings"
          blurIntensity={30}
          borderRadius={32}
          backgroundBlur={true}
          containerStyle={
            [
              style.flatten(
                ["justify-center"],
                [
                  feeButtonState.isGasInputOpen && "border-width-1",
                  "border-radius-64",
                  "border-color-indigo",
                ]
              ),
              { width: 150 },
            ] as ViewStyle
          }
          textStyle={style.flatten(["text-caption2"]) as ViewStyle}
          onPress={() =>
            feeButtonState.setIsGasInputOpen(!feeButtonState.isGasInputOpen)
          }
        />
        {feeButtonState.isGasInputOpen || !props.feeConfig.feeCurrency ? (
          <GasInput label={props.gasLabel} gasConfig={props.gasConfig} />
        ) : null}
      </React.Fragment>
    );
  }
);

export const getFeeErrorText = (error: Error): string | undefined => {
  switch (error.constructor) {
    case InsufficientFeeError:
      return "Insufficient available balance for transaction fee";
    case NotLoadedFeeError:
      return undefined;
    default:
      return error.message || "Unknown error";
  }
};

export const FeeButtonsInner: FunctionComponent<FeeButtonsProps> = observer(
  ({ labelStyle, containerStyle, errorLabelStyle, label, feeConfig }) => {
    const { priceStore, chainStore } = useStore();
    const style = useStyle();

    useEffect(() => {
      if (feeConfig.feeCurrency && !feeConfig.fee) {
        feeConfig.setFeeType("average");
      }
    }, [feeConfig]);

    // For chains without feeCurrencies, Keplr assumes tx doesn’t need to include information about the fee and the fee button does not have to be rendered.
    // The architecture is designed so that fee button is not rendered if the parental component doesn’t have a feeCurrency.
    // However, because there may be situations where the fee buttons is rendered before the chain information is changed,
    // and the fee button is an observer, and the sequence of rendering the observer may not appear stabilized,
    // so only handling the rendering in the parent component may not be sufficient
    // Therefore, this line double checks to ensure that the fee buttons is not rendered if fee currency doesn’t exist.
    // But because this component uses hooks, using a hook in the line below can cause an error.
    // Note that hooks should be used above this line, and only rendering-related logic should exist below this line.
    if (!feeConfig.feeCurrency) {
      return <React.Fragment />;
    }

    const lowFee = feeConfig.getFeeTypePretty("low");
    const lowFeePrice = priceStore.calculatePrice(lowFee);

    const averageFee = feeConfig.getFeeTypePretty("average");
    const averageFeePrice = priceStore.calculatePrice(averageFee);

    const highFee = feeConfig.getFeeTypePretty("high");
    const highFeePrice = priceStore.calculatePrice(highFee);

    let isFeeLoading = false;

    const error = feeConfig.error;
    const errorText: string | undefined = (() => {
      if (error) {
        if (error.constructor === NotLoadedFeeError) {
          isFeeLoading = true;
        }

        return getFeeErrorText(error);
      }
    })();

    const renderButton: (
      label: string,
      price: PricePretty | undefined,
      amount: CoinPretty,
      selected: boolean,
      onPress: () => void
    ) => React.ReactElement = (label, price, amount, selected, onPress) => {
      const isEvm = chainStore.current.features?.includes("evm") ?? false;

      return (
        <RectButton
          style={
            style.flatten(
              [
                "flex-row",
                "items-center",
                "justify-between",
                "padding-x-16",
                "padding-y-18",
              ],
              [selected && "background-color-indigo", "border-radius-12"]
            ) as ViewStyle
          }
          onPress={onPress}
        >
          <View style={style.flatten(["flex-row"])}>
            <Text style={style.flatten(["body3", "color-white"])}>{label}</Text>
            {price ? (
              <Text
                style={
                  style.flatten(
                    ["padding-top-2", "text-caption2", "margin-left-6"],
                    [selected ? "color-white" : "color-white@60%"]
                  ) as ViewStyle
                }
              >
                {price.toString()}
              </Text>
            ) : null}
          </View>
          <Text
            style={
              style.flatten([
                "text-center",
                "text-caption2",
                "color-white@60%",
              ]) as ViewStyle
            }
          >
            {amount.hideIBCMetadata(true).trim(true).toMetricPrefix(isEvm)}
          </Text>
        </RectButton>
      );
    };

    return (
      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-y-12"]) as ViewStyle,
          containerStyle,
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            labelStyle ??
              (style.flatten([
                "h6",
                "color-platinum-100",
                "margin-bottom-12",
              ]) as ViewStyle),
          ])}
        >
          {label}
        </Text>
        <View>
          {renderButton(
            "Low",
            lowFeePrice,
            lowFee,
            feeConfig.feeType === "low",
            () => {
              feeConfig.setFeeType("low");
            }
          )}
          <View
            style={style.flatten(["width-1", "margin-top-2"]) as ViewStyle}
          />
          {renderButton(
            "Average",
            averageFeePrice,
            averageFee,
            feeConfig.feeType === "average",
            () => {
              feeConfig.setFeeType("average");
            }
          )}
          <View
            style={style.flatten(["width-1", "margin-top-2"]) as ViewStyle}
          />
          {renderButton(
            "High",
            highFeePrice,
            highFee,
            feeConfig.feeType === "high",
            () => {
              feeConfig.setFeeType("high");
            }
          )}
        </View>
        {isFeeLoading ? (
          <View>
            <View
              style={
                style.flatten([
                  "absolute",
                  "height-16",
                  "justify-center",
                  "margin-top-2",
                  "margin-left-4",
                ]) as ViewStyle
              }
            >
              <LoadingSpinner
                size={14}
                color={style.get("color-loading-spinner").color}
              />
            </View>
          </View>
        ) : null}
        {!isFeeLoading && errorText ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute",
                  "text-caption1",
                  "color-red-250",
                  "margin-top-2",
                  "margin-left-4",
                ]) as ViewStyle,
                errorLabelStyle,
              ])}
            >
              {errorText}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
);
