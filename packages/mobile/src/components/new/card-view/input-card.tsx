import React, { ReactElement, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";

import { observer } from "mobx-react-lite";

export const InputCardView: React.forwardRef<
  TextInput,
  React.ComponentProps<typeof TextInput> & {
    label?: string;
    labelStyle?: ViewStyle;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: ViewStyle;
    inputStyle?: ViewStyle;
    placeholderText?: string;
    value?: any;
    rightIcon?: ReactElement;
    error?: string;
    errorMassageShow?: boolean;
    paragraph?: React.ReactNode;
  }
> = observer((props, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const {
    keyboardType,
    label,
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    inputStyle,
    rightIcon,
    error,
    paragraph,

    onBlur,
    onFocus,
    errorMassageShow = true,
    ...restProps
  } = props;
  const style = useStyle();

  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={
            [
              style.flatten([
                "padding-y-4",
                "color-white@60%",
                "margin-y-8",
                "body3",
              ]),
              labelStyle,
            ] as ViewStyle
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
              ["padding-y-12", "padding-x-18"],
              isFocused || error
                ? [
                    // The order is important.
                    // The border color has different priority according to state.
                    // The more in front, the lower the priority.
                    "border-width-1",
                    isFocused ? "border-color-indigo" : undefined,
                    error ? "border-color-red-250" : undefined,
                    !(props.editable ?? true) && "background-color-gray-50",
                  ]
                : []
            ),
            inputContainerStyle,
          ] as ViewStyle
        }
      >
        <View style={style.flatten(["flex-row"]) as ViewStyle}>
          <View style={style.flatten(["flex-3"]) as ViewStyle}>
            <TextInput
              keyboardType={
                keyboardType ?? Platform.OS === "ios"
                  ? "ascii-capable"
                  : "visible-password"
              }
              placeholderTextColor={style.flatten(["color-gray-200"]).color}
              style={
                [
                  style.flatten([
                    "body3",
                    "color-white",
                    "padding-0",
                    "justify-center",
                  ]),
                  inputStyle,
                ] as ViewStyle
              }
              returnKeyType="done"
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
              {...restProps}
              ref={ref}
            />
          </View>
          {rightIcon ? (
            <View
              style={
                style.flatten(["items-end", "justify-center"]) as ViewStyle
              }
            >
              {rightIcon}
            </View>
          ) : null}
        </View>
      </BlurBackground>
      {paragraph && !error ? (
        typeof paragraph === "string" ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute",
                  "text-caption2",
                  "color-gray-300",
                  "margin-top-2",
                  "margin-left-4",
                ]) as ViewStyle,
                errorLabelStyle,
              ])}
            >
              {paragraph}
            </Text>
          </View>
        ) : (
          paragraph
        )
      ) : null}
      {errorMassageShow ? (
        error ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute",
                  "text-caption2",
                  "color-red-250",
                  "margin-top-2",
                ]) as ViewStyle,
                errorLabelStyle,
              ])}
            >
              {error}
            </Text>
          </View>
        ) : null
      ) : null}
    </View>
  );
});
