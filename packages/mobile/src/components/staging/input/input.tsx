import React, { FunctionComponent } from "react";
import {
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../../styles";

export const TextInput: FunctionComponent<
  React.ComponentProps<typeof NativeTextInput> & {
    labelStyle?: TextStyle;
    containerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;

    label: string;
    error?: string;
  }
> = (props) => {
  const propsStyle = props.style;
  delete props.style;

  const style = useStyle();

  return (
    <React.Fragment>
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
          props.containerStyle,
        ])}
      >
        <NativeTextInput
          {...props}
          placeholderTextColor={
            props.placeholderTextColor ??
            style.get("color-text-black-low").color
          }
          style={StyleSheet.flatten([
            style.flatten(["body2", "color-text-black-medium", "padding-y-0"]),
            propsStyle,
          ])}
        />
      </View>
      {props.error ? (
        <Text
          style={StyleSheet.flatten([
            style.flatten(["text-caption1", "color-error"]),
            props.errorLabelStyle,
          ])}
        >
          {props.error}
        </Text>
      ) : null}
    </React.Fragment>
  );
};
