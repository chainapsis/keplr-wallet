import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { TextInput } from "./input";
import { Platform, TextStyle, View, ViewStyle } from "react-native";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { Button } from "../button";
import { useStyle } from "../../styles";
import * as RNLocalize from "react-native-localize";

export const AmountInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;

  label: string;

  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    amountConfig,
  }) => {
    const style = useStyle();

    const error = amountConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAmountError:
            // No need to show the error to user.
            return;
          case InvalidNumberAmountError:
            return "Invalid number";
          case ZeroAmountError:
            return "Amount is zero";
          case NegativeAmountError:
            return "Amount is negative";
          case InsufficientAmountError:
            return "Insufficient fund";
          default:
            return "Unknown error";
        }
      }
    }, [error]);

    return (
      <TextInput
        label={label}
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        inputContainerStyle={inputContainerStyle}
        errorLabelStyle={errorLabelStyle}
        value={amountConfig.amount}
        onChangeText={(text) => {
          amountConfig.setAmount(text);
        }}
        inputRight={
          <View
            style={style.flatten([
              "height-1",
              "overflow-visible",
              "justify-center",
            ])}
          >
            <Button
              text="MAX"
              mode={(() => {
                if (style.theme === "dark") {
                  return "light";
                } else {
                  return amountConfig.fraction === 1 ? "light" : "fill";
                }
              })()}
              size="small"
              style={style.flatten(["padding-x-5", "padding-y-3"])}
              containerStyle={style.flatten(
                ["height-24", "border-radius-4"],
                [
                  !amountConfig.fraction &&
                    "dark:background-color-platinum-500",
                  amountConfig.fraction === 1 &&
                    "dark:background-color-platinum-600",
                ]
              )}
              textStyle={style.flatten(
                ["normal-case", "text-caption2"],
                [
                  !amountConfig.fraction && "dark:color-platinum-50",
                  amountConfig.fraction === 1 && "dark:color-platinum-200",
                ]
              )}
              onPress={() => {
                amountConfig.setFraction(
                  !amountConfig.fraction ? 1 : undefined
                );
              }}
            />
          </View>
        }
        error={errorText}
        keyboardType={(() => {
          if (Platform.OS === "ios") {
            // In IOS, the numeric type keyboard has a decimal separator "." or "," depending on the language and region of the user device.
            // However, asset input in keplr unconditionally follows the US standard, so it must be ".".
            // However, if only "," appears on the keyboard, "." cannot be entered.
            // In this case, it is inevitable to use a different type of keyboard.
            if (RNLocalize.getNumberFormatSettings().decimalSeparator !== ".") {
              return "numbers-and-punctuation";
            }
            return "numeric";
          } else {
            // In Android, the numeric type keyboard has both "." and ",".
            // So, there is no need to use other keyboard type on any case.
            return "numeric";
          }
        })()}
      />
    );
  }
);
