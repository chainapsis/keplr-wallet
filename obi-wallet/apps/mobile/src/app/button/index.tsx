import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedbackProps,
} from "react-native";
import React from "react";

export type ButtonProps = TouchableWithoutFeedbackProps;

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export function Button(props: ButtonProps) {
  const buttonProps = {
    ...props,
    style: [styles.button, props.style],
  };

  if (Platform.OS === "ios") {
    return <TouchableOpacity {...buttonProps} />;
  } else {
    return <TouchableNativeFeedback {...buttonProps} />;
  }
}
