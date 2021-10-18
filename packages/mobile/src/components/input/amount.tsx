import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { TextInput } from "./input";
import { TextStyle, View, ViewStyle } from "react-native";
import {
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NagativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { Button } from "../button";
import { useStyle } from "../../styles";

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
              mode={amountConfig.isMax ? "light" : "fill"}
              size="small"
              style={style.flatten(["padding-x-5", "padding-y-3"])}
              containerStyle={style.flatten(["height-24", "border-radius-4"])}
              textStyle={style.flatten(["normal-case", "text-caption2"])}
              onPress={() => {
                amountConfig.setIsMax(!amountConfig.isMax);
              }}
            />
          </View>
        }
        error={errorText}
        keyboardType="numeric"
      />
    );
  }
);
