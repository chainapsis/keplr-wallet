import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { TextInput } from "./input";
import { TextStyle, ViewStyle } from "react-native";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NagativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";

export const AmountInput: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  buttonContainerStyle?: ViewStyle;
  errorLabelStyle?: TextStyle;

  label: string;

  amountConfig: IAmountConfig;
}> = observer(
  ({
    labelStyle,
    containerStyle,
    buttonContainerStyle,
    errorLabelStyle,
    label,
    amountConfig,
  }) => {
    const error = amountConfig.getError();
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
          case NagativeAmountError:
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
        buttonContainerStyle={buttonContainerStyle}
        errorLabelStyle={errorLabelStyle}
        value={amountConfig.amount}
        onChangeText={(text) => {
          amountConfig.setAmount(text);
        }}
        error={errorText}
        keyboardType="numeric"
      />
    );
  }
);
