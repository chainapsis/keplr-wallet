import React from "react";
import {
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../../styles";

// eslint-disable-next-line react/display-name
export const TextInput = React.forwardRef<
  NativeTextInput,
  React.ComponentProps<typeof NativeTextInput> & {
    labelStyle?: TextStyle;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;

    label: string;
    error?: string;

    paragraph?: React.ReactNode;

    topInInputContainer?: React.ReactNode;
    bottomInInputContainer?: React.ReactNode;
  }
>((props, ref) => {
  const { style: propsStyle, ...restProps } = props;

  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["padding-bottom-16"]),
        props.containerStyle,
      ])}
    >
      <Text
        style={StyleSheet.flatten([
          style.flatten([
            "subtitle2",
            "color-text-black-medium",
            "margin-bottom-3",
          ]),
          props.labelStyle,
        ])}
      >
        {props.label}
      </Text>
      <View
        style={StyleSheet.flatten([
          style.flatten(
            [
              "background-color-white",
              "padding-x-11",
              "padding-y-12",
              "border-radius-4",
              "border-width-1",
              "border-color-border-white",
            ],
            [
              props.error ? "border-color-error" : undefined,
              !(props.editable ?? true) && "background-color-disabled",
            ]
          ),
          props.inputContainerStyle,
        ])}
      >
        {props.topInInputContainer}
        <NativeTextInput
          placeholderTextColor={
            props.placeholderTextColor ??
            style.get("color-text-black-low").color
          }
          style={StyleSheet.flatten([
            style.flatten(["body2", "color-text-black-medium", "padding-0"]),
            propsStyle,
          ])}
          {...restProps}
          ref={ref}
        />
        {props.bottomInInputContainer}
      </View>
      {props.paragraph && !props.error ? (
        typeof props.paragraph === "string" ? (
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten(["absolute", "text-caption1", "color-primary"]),
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
              style.flatten(["absolute", "text-caption1", "color-error"]),
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
