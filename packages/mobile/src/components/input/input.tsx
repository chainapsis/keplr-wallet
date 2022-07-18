import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../styles";

// eslint-disable-next-line react/display-name
export const TextInput = React.forwardRef<
  NativeTextInput,
  React.ComponentProps<typeof NativeTextInput> & {
    labelStyle?: TextStyle;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;

    label?: string;
    error?: string;

    paragraph?: React.ReactNode;

    topInInputContainer?: React.ReactNode;
    bottomInInputContainer?: React.ReactNode;

    inputLeft?: React.ReactNode;
    inputRight?: React.ReactNode;
  }
>((props, ref) => {
  const {
    style: propsStyle,
    labelStyle,
    containerStyle,
    inputContainerStyle,
    errorLabelStyle,
    label,
    error,
    paragraph,
    topInInputContainer,
    bottomInInputContainer,
    inputLeft,
    inputRight,
    ...restProps
  } = props;

  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["padding-bottom-28"]),
        containerStyle,
      ])}
    >
      {label ? (
        <Text
          style={StyleSheet.flatten([
            style.flatten(["subtitle3", "color-text-label", "margin-bottom-3"]),
            labelStyle,
          ])}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={StyleSheet.flatten([
          style.flatten(
            [
              "background-color-white",
              "dark:background-color-platinum-700",
              "padding-x-11",
              "padding-y-12",
              "border-radius-6",
              "border-width-1",
              "border-color-gray-100@20%",
              "dark:border-color-platinum-600@50%",
            ],
            [
              error ? "border-color-red-200" : undefined,
              error ? "dark:border-color-red-400" : undefined,
              !(props.editable ?? true) && "background-color-gray-50",
              !(props.editable ?? true) && "dark:background-color-platinum-500",
            ]
          ),
          inputContainerStyle,
        ])}
      >
        {topInInputContainer}
        <View style={style.flatten(["flex-row", "items-center"])}>
          {inputLeft}
          <NativeTextInput
            placeholderTextColor={
              props.placeholderTextColor ??
              style.flatten(
                ["color-gray-300", "dark:color-platinum-500"],
                [!(props.editable ?? true) && "dark:color-platinum-200"]
              ).color
            }
            style={StyleSheet.flatten([
              style.flatten(
                [
                  "padding-0",
                  "body2-in-text-input",
                  "color-gray-600",
                  "dark:color-platinum-50",
                  "flex-1",
                ],
                [
                  !(props.editable ?? true) && "color-gray-300",
                  !(props.editable ?? true) && "dark:color-platinum-200",
                ]
              ),
              Platform.select({
                ios: {},
                android: {
                  // On android, the text input's height does not equals to the line height by strange.
                  // To fix this problem, set the height explicitly.
                  height: style.get("body2-in-text-input")?.lineHeight,
                },
              }),
              propsStyle,
            ])}
            {...restProps}
            ref={ref}
          />
          {inputRight}
        </View>
        {bottomInInputContainer}
      </View>
      {paragraph && !error ? (
        typeof paragraph === "string" ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute",
                  "text-caption2",
                  "color-blue-400",
                  "dark:color-blue-300",
                  "margin-top-2",
                  "margin-left-4",
                ]),
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
      {error ? (
        <View>
          <Text
            style={StyleSheet.flatten([
              style.flatten([
                "absolute",
                "text-caption2",
                "color-red-400",
                "margin-top-2",
                "margin-left-4",
              ]),
              errorLabelStyle,
            ])}
          >
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
