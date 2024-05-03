import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Platform, Text, View, ViewStyle } from "react-native";
import {
  BridgeAmountError,
  EmptyAmountError,
  IAmountConfig,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { TextInput } from "components/input";
import { useStyle } from "styles/index";
import * as RNLocalize from "react-native-localize";
import { ReloadIcon } from "../icon/reload-icon";
import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { useStore } from "stores/index";
import { parseDollarAmount } from "utils/format/format";
import { BlurButton } from "../button/blur-button";

export const AmountInputSection: FunctionComponent<{
  amountConfig: IAmountConfig;
}> = observer(({ amountConfig }) => {
  const style = useStyle();
  const { priceStore } = useStore();
  const [isToggleClicked, setIsToggleClicked] = useState<boolean>(false);
  const [inputInUsd, setInputInUsd] = useState<string | undefined>("");
  const [selection, setSelection] = useState<
    | {
        start: number;
      }
    | undefined
  >({
    start: 0,
  });
  const handleFocus = () => {
    setSelection(undefined);
  };

  const convertToUsd = (currency: any) => {
    const value = priceStore.calculatePrice(currency);
    return value && value.shrink(true).maxDecimals(6).toString();
  };

  useEffect(() => {
    const currencyDecimals = amountConfig.sendCurrency.coinDecimals;

    let dec = new Dec(amountConfig.amount ? amountConfig.amount : "0");
    dec = dec.mul(DecUtils.getTenExponentNInPrecisionRange(currencyDecimals));
    const amountInNumber = dec.truncate().toString();
    const inputValue = new CoinPretty(
      amountConfig.sendCurrency,
      new Int(amountInNumber)
    );
    const inputValueInUsd = convertToUsd(inputValue);
    setInputInUsd(inputValueInUsd);
  }, [amountConfig.amount]);

  const error = amountConfig.error;
  const errorText: string | undefined = useMemo(() => {
    if (error) {
      switch (error.constructor) {
        case EmptyAmountError:
          // No need to show the error to user.x
          return;
        case InvalidNumberAmountError:
          return "Invalid number";
        case ZeroAmountError:
          return "Please enter a valid amount";
        case NegativeAmountError:
          return "Amount is negative";
        case InsufficientAmountError:
          return "Insufficient fund";
        case BridgeAmountError:
          return error.message;
        default:
          return "Unknown error";
      }
    }
  }, [error]);

  const validateDecimalNumber = (input: string) => {
    // Use the match() method with a regular expression
    const isDecimal = input.match(/^\d*\.?\d*$/);

    // Return true if it's a valid decimal number, otherwise return false
    return isDecimal !== null;
  };

  return (
    <React.Fragment>
      <View style={style.flatten(["flex-1"])} />
      <TextInput
        style={
          style.flatten(
            ["h2", "font-medium", "height-58", "flex-0"],
            [errorText ? "color-red-250" : "color-white"]
          ) as ViewStyle
        }
        inputContainerStyle={
          style.flatten([
            "border-width-0",
            "padding-x-0",
            "padding-y-0",
          ]) as ViewStyle
        }
        containerStyle={
          style.flatten(["margin-top-12", "padding-y-0"]) as ViewStyle
        }
        maxLength={20}
        placeholder="0"
        innerInputContainerStyle={style.flatten([
          "justify-center",
          "flex-wrap",
        ])}
        inputRight={
          <Text
            style={
              style.flatten([
                "h2",
                "color-gray-300",
                "margin-left-8",
                "font-normal",
              ]) as ViewStyle
            }
          >
            {isToggleClicked
              ? priceStore.defaultVsCurrency.toUpperCase()
              : amountConfig.sendCurrency.coinDenom}
          </Text>
        }
        placeholderTextColor={errorText ? "red" : "white"}
        value={
          isToggleClicked
            ? parseDollarAmount(inputInUsd).toString()
            : amountConfig.amount
        }
        selection={selection}
        onSelectionChange={handleFocus}
        onChangeText={(value) => {
          if (validateDecimalNumber(value)) {
            if (value !== "0") {
              // Remove leading zeros
              for (let i = 0; i < value.length; i++) {
                if (value[i] === "0" && value[i + 1] !== ".") {
                  value = value.replace("0", "");
                } else {
                  break;
                }
              }
            }
            isToggleClicked
              ? parseDollarAmount(inputInUsd)
              : amountConfig.setAmount(value);
          }
        }}
        topInInputContainer={
          <Text
            style={
              [
                style.flatten(["body3", "color-gray-100", "text-center"]),
              ] as ViewStyle
            }
          >
            {"Enter amount"}
          </Text>
        }
        bottomInInputContainer={
          <Text
            style={
              style.flatten([
                "body3",
                "color-white@60%",
                "text-center",
              ]) as ViewStyle
            }
          >
            {isToggleClicked
              ? `${amountConfig.amount} ${amountConfig.sendCurrency.coinDenom}`
              : inputInUsd
              ? `${inputInUsd} ${priceStore.defaultVsCurrency.toUpperCase()}`
              : ""}
          </Text>
        }
        error={errorText}
        errorLabelStyle={
          style.flatten([
            "body3",
            "width-full",
            "text-center",
            "margin-top-8",
          ]) as ViewStyle
        }
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
      <View style={style.flatten(["flex-1"])} />
      <View
        style={
          style.flatten([
            "flex-row",
            "justify-evenly",
            "margin-top-28",
          ]) as ViewStyle
        }
      >
        <View style={style.flatten(["flex-1"]) as ViewStyle}>
          <BlurButton
            text={`Change to ${
              isToggleClicked
                ? amountConfig.sendCurrency.coinDenom
                : priceStore.defaultVsCurrency.toUpperCase()
            }`}
            backgroundBlur={false}
            leftIcon={
              <View style={style.flatten(["margin-right-2"]) as ViewStyle}>
                <ReloadIcon
                  size={20}
                  color={
                    amountConfig.sendCurrency["coinGeckoId"]
                      ? "white"
                      : "#323C4A"
                  }
                />
              </View>
            }
            disable={!amountConfig.sendCurrency["coinGeckoId"]}
            borderRadius={32}
            onPress={() => {
              setIsToggleClicked(!isToggleClicked);
            }}
            containerStyle={
              style.flatten([
                "border-width-1",
                "margin-4",
                "padding-6",
                "justify-center",
                amountConfig.sendCurrency["coinGeckoId"]
                  ? "border-color-gray-300"
                  : "border-color-platinum-400",
              ]) as ViewStyle
            }
            textStyle={
              style.flatten([
                "body3",
                amountConfig.sendCurrency["coinGeckoId"]
                  ? "color-white"
                  : "color-platinum-400",
              ]) as ViewStyle
            }
          />
        </View>
        <View style={style.flatten(["flex-1"]) as ViewStyle}>
          <BlurButton
            text="Use max available"
            backgroundBlur={false}
            borderRadius={32}
            onPress={() => {
              setSelection({ start: 0 });
              amountConfig.toggleIsMax();
            }}
            containerStyle={
              style.flatten([
                "border-width-1",
                "border-color-gray-300",
                "padding-6",
                "margin-4",
                "justify-center",
              ]) as ViewStyle
            }
            textStyle={style.flatten(["body3", "color-white"]) as ViewStyle}
          />
        </View>
      </View>
    </React.Fragment>
  );
});
