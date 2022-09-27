import { Text } from "@obi-wallet/common";
import { FC } from "react";
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableHighlight,
  TouchableWithoutFeedbackProps,
  View,
  GestureResponderEvent,
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
  gray: {
    text: {
      color: "#00000082",
    },
    button: {
      backgroundColor: "#949494cc",
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
  disabled?: boolean;
  LeftIcon?: FC<SvgProps>;
  RightIcon?: FC<SvgProps>;
}

export function Button({
  flavor,
  label,
  disabled,
  LeftIcon,
  RightIcon,
  ...props
}: ButtonProps) {
  const flavorStyles = flavors[disabled ? "gray" : flavor];
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
      disabled ? baseStyles.disabledButton : undefined,
      props.style,
    ],
  };

  const onPress = (e: GestureResponderEvent) => {
    if (!disabled && typeof props.onPress === "function") {
      props.onPress(e);
    }
  };

  if (Platform.OS === "ios") {
    return <TouchableHighlight {...buttonProps} onPress={onPress} />;
  } else {
    return (
      <TouchableNativeFeedback {...buttonProps} onPress={onPress}>
        <View {...buttonProps} />
      </TouchableNativeFeedback>
    );
  }
}
