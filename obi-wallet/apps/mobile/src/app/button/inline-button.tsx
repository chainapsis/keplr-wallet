import { Text } from "@obi-wallet/common";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedbackProps,
} from "react-native";

const baseStyles = StyleSheet.create({
  text: {
    fontWeight: "500",
    fontSize: 12,
    color: "#6959E6",
  },
  button: {
    height: 29,
    borderWidth: 1,
    borderRadius: 19,
    borderColor: "rgba(105, 89, 230, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginLeft: 8,
  },
});

export interface InlineButtonProps
  extends Omit<TouchableWithoutFeedbackProps, "children"> {
  label: string;
}

export function InlineButton({ label, ...props }: InlineButtonProps) {
  const children = <Text style={baseStyles.text}>{label}</Text>;
  const buttonProps = {
    ...props,
    children,
    style: [baseStyles.button, props.style],
  };

  if (Platform.OS === "ios") {
    return <TouchableHighlight {...buttonProps} />;
  } else {
    return <TouchableNativeFeedback {...buttonProps} />;
  }
}
