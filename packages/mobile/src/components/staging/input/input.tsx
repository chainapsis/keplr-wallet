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
    inputContainerStyle?: ViewStyle;
    errorLabelStyle?: TextStyle;

    label: string;
    error?: string;

    paragraph?: React.ReactNode;
  }
> = (props) => {
  const propsStyle = props.style;
  delete props.style;

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
        <NativeTextInput
          {...props}
          placeholderTextColor={
            props.placeholderTextColor ??
            style.get("color-text-black-low").color
          }
          style={StyleSheet.flatten([
            style.flatten(["body2", "color-text-black-medium", "padding-0"]),
            propsStyle,
          ])}
        />
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
};
