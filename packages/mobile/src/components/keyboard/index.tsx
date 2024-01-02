import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";
import Animated from "react-native-reanimated";

export const KeyboardSpacerView = () => {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    const event1 = Keyboard.addListener("keyboardWillShow", keyboardWillShow);
    const event2 = Keyboard.addListener("keyboardWillHide", keyboardWillHide);

    return () => {
      event1.remove();
      event2.remove();
    };
  }, []);

  const keyboardWillShow = (event: KeyboardEvent) => {
    setHeight(event.endCoordinates.height);
  };

  const keyboardWillHide = (_: KeyboardEvent) => {
    setHeight(0);
  };

  return (
    <Animated.View
      style={[
        {
          height: height,
        },
      ]}
    />
  );
};
