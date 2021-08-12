import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useStyle } from "../../../styles";

export const Toggle: FunctionComponent<{
  on: boolean;
  onChange(onOrOff: boolean): void;
}> = ({ on, onChange }) => {
  const style = useStyle();

  const offColor = style.get("color-text-black-low").color;
  const onColor = style.get("color-primary").color;

  const [animatedOnValue] = useState(() => new Animated.Value(on ? 1 : 0));

  const ballLeft = useMemo(() => {
    return animatedOnValue.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 26],
    });
  }, [animatedOnValue]);

  const color = useMemo(() => {
    return animatedOnValue.interpolate({
      inputRange: [0, 1],
      outputRange: [offColor, onColor],
    });
  }, [animatedOnValue, offColor, onColor]);

  useEffect(() => {
    if (on) {
      Animated.timing(animatedOnValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedOnValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [animatedOnValue, on]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onChange(!on);
      }}
    >
      <Animated.View
        style={StyleSheet.flatten([
          style.flatten([
            "width-54",
            "height-30",
            "border-width-1",
            "border-radius-64",
            "flex-row",
            "items-center",
          ]),
          {
            borderColor: color,
          },
        ])}
      >
        <Animated.View
          style={StyleSheet.flatten([
            style.flatten(["width-24", "height-24", "border-radius-64"]),
            {
              backgroundColor: color,
              transform: [{ translateX: ballLeft }],
            },
          ])}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
