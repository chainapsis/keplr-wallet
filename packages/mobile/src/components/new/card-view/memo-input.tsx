import React, { FunctionComponent, useState } from "react";
import { Platform, Text, TextInput, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";

import { observer } from "mobx-react-lite";
import { IMemoConfig } from "@keplr-wallet/hooks";

export const MemoInputView: FunctionComponent<{
  label?: string;
  containerStyle?: ViewStyle;
  inputcontainerStyle?: ViewStyle;
  placeholderText?: string;
  memoConfig: IMemoConfig;
  onFocus?: any;
  onBlur?: any;
}> = observer(
  ({
    label,
    containerStyle,
    inputcontainerStyle,
    placeholderText,
    memoConfig,
    onFocus,
    onBlur,
  }) => {
    const style = useStyle();
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={containerStyle}>
        {label ? (
          <Text
            style={
              style.flatten([
                "padding-y-4",
                "color-gray-200",
                "margin-y-8",
              ]) as ViewStyle
            }
          >
            {label}
          </Text>
        ) : null}
        <BlurBackground
          borderRadius={12}
          blurIntensity={16}
          containerStyle={
            [
              style.flatten(
                ["padding-y-12", "padding-x-18", "flex-row"],
                isFocused
                  ? [
                      // The order is important.
                      // The border color has different priority according to state.
                      // The more in front, the lower the priority.
                      "border-width-1",
                      isFocused ? "border-color-indigo" : undefined,
                    ]
                  : []
              ),
              inputcontainerStyle,
            ] as ViewStyle
          }
        >
          <View style={style.flatten(["flex-3"]) as ViewStyle}>
            <TextInput
              placeholderTextColor={style.flatten(["color-gray-200"]).color}
              style={
                style.flatten([
                  "body3",
                  "color-white",
                  "padding-0",
                ]) as ViewStyle
              }
              keyboardType={
                Platform.OS === "ios" ? "ascii-capable" : "visible-password"
              }
              returnKeyType="done"
              placeholder={placeholderText}
              value={memoConfig.memo}
              onChangeText={(text: string) => {
                memoConfig.setMemo(text);
              }}
              maxLength={100}
              onFocus={(e) => {
                setIsFocused(true);

                if (onFocus) {
                  onFocus(e);
                }
              }}
              onBlur={(e) => {
                setIsFocused(false);

                if (onBlur) {
                  onBlur(e);
                }
              }}
            />
          </View>
        </BlurBackground>
      </View>
    );
  }
);
