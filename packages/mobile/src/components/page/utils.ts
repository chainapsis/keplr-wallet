import { useIsFocused, useRoute } from "@react-navigation/native";
import { usePageScrollPosition } from "../../providers/page-scroll-position";
import { useEffect } from "react";
import { Animated } from "react-native";
import { useFocusedScreen } from "../../providers/focused-screen";

export const usePageRegisterScrollYValue = () => {
  const route = useRoute();

  const pageScrollPosition = usePageScrollPosition();

  useEffect(() => {
    const key = route.key;

    pageScrollPosition.createScrollYValueOf(key, 0);

    return () => {
      pageScrollPosition.releaseScrollYValueOf(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.key]);
  return (
    pageScrollPosition.getScrollYValueOf(route.key) ?? new Animated.Value(0)
  );
};

export const useSetFocusedScreen = () => {
  const route = useRoute();
  const isFocused = useIsFocused();

  const focusedScreen = useFocusedScreen();

  useEffect(() => {
    if (isFocused) {
      focusedScreen.setCurrent({
        name: route.name,
        key: route.key,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, route.key, route.name]);
};
