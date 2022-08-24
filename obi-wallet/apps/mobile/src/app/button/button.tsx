import { Text } from "@obi-wallet/common";
import { FC } from "react";
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableHighlight,
  TouchableWithoutFeedbackProps,
  View,
} from "react-native";
import { SvgProps } from "react-native-svg";

const flavors = {
  blue: {
    text: {
      color: "#040317",
    },
    button: {
      backgroundColor: "#59D6E6",
    },
  },
  green: {
    text: {
      color: "#040317",
    },
    button: {
      backgroundColor: "#48C95F",
    },
  },
  purple: {
    text: {
      color: "#FFFFFF",
    },
    button: {
      backgroundColor: "#8877EA",
    },
  },
};

const baseStyles = StyleSheet.create({
  leftIcon: {
    marginRight: 8,
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export interface ButtonProps
  extends Omit<TouchableWithoutFeedbackProps, "children"> {
  flavor: keyof typeof flavors;
  label: string;
  LeftIcon?: FC | JSX.Element;
  RightIcon?: FC | JSX.Element;
}

export function Button({
  flavor,
  label,
  LeftIcon,
  RightIcon,
  ...props
}: ButtonProps) {
  const flavorStyles = flavors[flavor];
  const children = (
    <View style={[baseStyles.button, flavorStyles.button]}>
      {LeftIcon ? (
        <LeftIcon width={24} height={24} style={baseStyles.leftIcon} />
      ) : null}
      <Text style={[baseStyles.text, flavorStyles.text]}>{label}</Text>
      {RightIcon ? <RightIcon width={24} height={24} /> : null}
    </View>
  );
  const buttonProps = {
    ...props,
    children,
    style: [
      baseStyles.button,
      flavorStyles.button,
      props.disabled ? baseStyles.disabledButton : undefined,
      props.style,
    ],
  };

  if (Platform.OS === "ios") {
    return <TouchableHighlight {...buttonProps} />;
  } else {
    return <TouchableNativeFeedback {...buttonProps} />;
  }
}
