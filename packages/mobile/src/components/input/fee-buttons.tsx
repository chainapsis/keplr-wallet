import React, { FunctionComponent, useEffect, useState } from "react";
import { StyleSheet, Text, TextStyle, View, ViewProps } from "react-native";
import { useStyle } from "../../styles";
import { observer } from "mobx-react-lite";
import { action, autorun, makeObservable, observable } from "mobx";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@keplr-wallet/hooks";
import { GasInput } from "./gas";
import { useStore } from "../../stores";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";
import { Button } from "../button";
import { AutoGasModal } from "../../modals/auto-gas";
import { FeeSelector } from "./fee-selector";

export interface FeeButtonsProps {
  labelStyle?: TextStyle;
  containerStyle?: ViewProps;
  buttonsContainerStyle?: ViewProps;
  errorLabelStyle?: TextStyle;

  label: string;
  gasLabel: string;

  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  gasSimulator?: IGasSimulator;

  showFeeCurrencySelectorUnderSetGas?: boolean;
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

    const { queriesStore } = useStore();

    useEffect(() => {
      // Try to find other fee currency if the account doesn't have enough fee to pay.
      // This logic can be slightly complex, so use mobx's `autorun`.
      // This part fairly different with the approach of react's hook.
      let skip = false;
      // Try until 500ms to avoid the confusion to user.
      const timeoutId = setTimeout(() => {
        skip = true;
      }, 500);

      const disposer = autorun(() => {
        if (
          !skip &&
          !props.feeConfig.isManual &&
          props.feeConfig.feeCurrencies.length > 1 &&
          props.feeConfig.feeCurrency &&
          props.feeConfig.feeCurrencies[0].coinMinimalDenom ===
            props.feeConfig.feeCurrency.coinMinimalDenom
        ) {
          const queryBalances = queriesStore
            .get(props.feeConfig.chainId)
            .queryBalances.getQueryBech32Address(props.feeConfig.sender);

          // Basically, `FeeConfig` implementation select the first fee currency as default.
          // So, let's put the priority to first fee currency.
          const firstFeeCurrency = props.feeConfig.feeCurrencies[0];
          const firstFeeCurrencyBal = queryBalances.getBalanceFromCurrency(
            firstFeeCurrency
          );

          if (props.feeConfig.feeType) {
            const fee = props.feeConfig.getFeeTypePrettyForFeeCurrency(
              firstFeeCurrency,
              props.feeConfig.feeType
            );
            if (firstFeeCurrencyBal.toDec().lt(fee.toDec())) {
              // Not enough balances for fee.
              // Try to find other fee currency to send.
              for (const feeCurrency of props.feeConfig.feeCurrencies) {
                const feeCurrencyBal = queryBalances.getBalanceFromCurrency(
                  feeCurrency
                );
                const fee = props.feeConfig.getFeeTypePrettyForFeeCurrency(
                  feeCurrency,
                  props.feeConfig.feeType
                );

                if (feeCurrencyBal.toDec().gte(fee.toDec())) {
                  props.feeConfig.setAutoFeeCoinMinimalDenom(
                    feeCurrency.coinMinimalDenom
                  );
                  skip = true;
                  return;
                }
              }
            }
          }
        }
      });

      return () => {
        clearTimeout(timeoutId);
        disposer();
      };
    }, [props.feeConfig, queriesStore]);

    return (
      <React.Fragment>
        {props.feeConfig.feeCurrencies.length > 1 &&
        !props.showFeeCurrencySelectorUnderSetGas ? (
          <FeeSelector label="Fee Token" feeConfig={props.feeConfig} />
        ) : null}
        {props.feeConfig.feeCurrency ? <FeeButtonsInner {...props} /> : null}
        {feeButtonState.isGasInputOpen || !props.feeConfig.feeCurrency ? (
          props.gasSimulator ? (
            props.feeConfig.feeCurrencies.length > 1 &&
            props.showFeeCurrencySelectorUnderSetGas ? (
              <React.Fragment>
                <FeeSelector label="Fee Token" feeConfig={props.feeConfig} />
                <GasInput label={props.gasLabel} gasConfig={props.gasConfig} />
              </React.Fragment>
            ) : (
              <GasInput label={props.gasLabel} gasConfig={props.gasConfig} />
            )
          ) : (
            <GasInput label={props.gasLabel} gasConfig={props.gasConfig} />
          )
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
  ({
    labelStyle,
    containerStyle,
    buttonsContainerStyle,
    errorLabelStyle,
    label,
    feeConfig,
    gasConfig,
    gasSimulator,
  }) => {
    const { priceStore } = useStore();

    const style = useStyle();

    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

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
      return (
        <RectButton
          style={style.flatten(
            [
              "flex-1",
              "items-center",
              "padding-y-14",
              "background-color-white",
              "dark:background-color-platinum-700",
            ],
            [
              selected && "background-color-blue-100",
              selected && "dark:background-color-platinum-400",
            ]
          )}
          rippleColor={
            style.flatten(["color-blue-100", "dark:color-platinum-300"]).color
          }
          onPress={onPress}
        >
          <Text
            style={style.flatten(
              ["h5", "color-platinum-400", "dark:color-platinum-200"],
              [
                selected && "color-blue-400",
                selected && "dark:color-platinum-10",
              ]
            )}
          >
            {label}
          </Text>
          {price ? (
            <Text
              style={style.flatten(
                [
                  "padding-top-2",
                  "h7",
                  "color-gray-300",
                  "dark:color-platinum-400",
                ],
                [
                  selected && "color-blue-300",
                  selected && "dark:color-platinum-100",
                ]
              )}
            >
              {price.toString()}
            </Text>
          ) : null}
          <Text
            style={style.flatten(
              [
                "padding-top-2",
                "text-caption1",
                "color-gray-200",
                "dark:color-platinum-500",
              ],
              [
                selected && "color-blue-200",
                selected && "dark:color-platinum-200",
              ]
            )}
          >
            {amount.maxDecimals(6).trim(true).separator("").toString()}
          </Text>
        </RectButton>
      );
    };

    return (
      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-bottom-28"]),
          containerStyle,
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(["subtitle3", "color-text-label", "margin-bottom-3"]),
            labelStyle,
          ])}
        >
          {label}
        </Text>
        <View
          style={StyleSheet.flatten([
            style.flatten([
              "flex-row",
              "border-radius-6",
              "border-width-1",
              "border-color-gray-100@20%",
              "dark:border-color-platinum-600@50%",
              "overflow-hidden",
            ]),
            buttonsContainerStyle,
          ])}
        >
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
            style={style.flatten([
              "width-1",
              "background-color-gray-100@20%",
              "dark:background-color-platinum-600@50%",
            ])}
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
            style={style.flatten([
              "width-1",
              "background-color-gray-100@20%",
              "dark:background-color-platinum-600@50%",
            ])}
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
              style={style.flatten([
                "absolute",
                "height-16",
                "justify-center",
                "margin-top-2",
                "margin-left-4",
              ])}
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
                  "color-red-400",
                  "margin-top-2",
                  "margin-left-4",
                ]),
                errorLabelStyle,
              ])}
            >
              {errorText}
            </Text>
          </View>
        ) : null}
        {gasSimulator && (
          <View>
            <View
              style={StyleSheet.flatten([
                style.flatten(["flex-row", "justify-center", "margin-top-20"]),
              ])}
            >
              <Button
                text="Advanced"
                mode="text"
                style={StyleSheet.flatten([
                  style.flatten(["width-122", "items-center"]),
                ])}
                onPress={() => setIsOpenModal(!isOpenModal)}
              />
            </View>
            <AutoGasModal
              isOpen={isOpenModal}
              close={() => setIsOpenModal(false)}
              gasConfig={gasConfig}
              gasSimulator={gasSimulator}
            />
          </View>
        )}
      </View>
    );
  }
);
