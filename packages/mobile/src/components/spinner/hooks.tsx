import { useMemo } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const useSpinAnimated = (isRefreshing: boolean = true) => {
  const spin = useSharedValue(0);

  // Define the animation configuration
  const animConfig = useMemo(() => {
    return {
      duration: 1200,
      easing: Easing.linear,
    };
  }, []);

  // Define the animation logic
  const startSpin = () => {
    spin.value = withRepeat(withTiming(360, animConfig), -1, false);
  };

  // Trigger the initial animation
  useMemo(() => {
    if (isRefreshing) {
      startSpin();
    }
  }, []);

  // Define the animated style
  return useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spin.value}deg` }],
    };
  });
};
