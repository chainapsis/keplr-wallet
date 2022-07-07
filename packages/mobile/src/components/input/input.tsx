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
  const { style: propsStyle, ...restProps } = props;

  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["padding-bottom-28"]),
        props.containerStyle,
      ])}
    >
      {props.label ? (
        <Text
          style={StyleSheet.flatten([
            style.flatten([
              "subtitle3",
              "color-platinum-400",
              "dark:color-platinum-200",
              "margin-bottom-3",
            ]),
            props.labelStyle,
          ])}
        >
          {props.label}
        </Text>
      ) : null}
      <View
        style={StyleSheet.flatten([
          style.flatten(
            [
              "background-color-white",
              "dark:background-color-platinum-600",
              "padding-x-11",
              "padding-y-12",
              "border-radius-4",
              "border-width-1",
              "border-color-gray-100@50%",
              "dark:border-color-platinum-500@50%",
            ],
            [
              props.error ? "border-color-red-200" : undefined,
              props.error ? "dark:border-color-red-400" : undefined,
              !(props.editable ?? true) && "background-color-gray-50",
              !(props.editable ?? true) && "dark:background-color-platinum-500",
            ]
          ),
          props.inputContainerStyle,
        ])}
      >
        {props.topInInputContainer}
        <View style={style.flatten(["flex-row", "items-center"])}>
          {props.inputLeft}
          <NativeTextInput
            placeholderTextColor={
              props.placeholderTextColor ??
              style.get("color-text-black-low").color
            }
            style={StyleSheet.flatten([
              style.flatten([
                "padding-0",
                "body2-in-text-input",
                "color-text-black-medium",
                "flex-1",
              ]),
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
          {props.inputRight}
        </View>
        {props.bottomInInputContainer}
      </View>
      {props.paragraph && !props.error ? (
        typeof props.paragraph === "string" ? (
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
                props.errorLabelStyle,
              ])}
            >
              {props.paragraph}
            </Text>
          </View>
        ) : (
          props.paragraph
        )
      ) : null}
      {props.error ? (
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
              props.errorLabelStyle,
            ])}
          >
            {props.error}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
