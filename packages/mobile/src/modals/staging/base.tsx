import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SafeAreaView, View } from "react-native";
import { useStyle } from "../../styles";
import Animated, { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ModalBaseProps {
  align: "top" | "center" | "bottom";
  isOpen: boolean;
  close: () => void;
  transitionDuration?: number;
  openTransitionDuration?: number;
  closeTransitionDuration?: number;
  onCloseTransitionEnd?: () => void;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  children,
  align,
  isOpen,
  transitionDuration = 500,
  openTransitionDuration,
  closeTransitionDuration,
  onCloseTransitionEnd,
}) => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();

  const closeTransitionRef = useRef(onCloseTransitionEnd);
  closeTransitionRef.current = onCloseTransitionEnd;

  const [areaLayout, setAreaLayout] = useState<
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | undefined
  >();
  const [layout, setLayout] = useState<
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | undefined
  >();

  const process = useRef(new Animated.Value(0));

  const paddingTopAnimated = useMemo(() => {
    switch (align) {
      case "top":
        return process.current.interpolate({
          inputRange: [0, 1],
          outputRange: [(areaLayout?.height ?? 0) + safeAreaInsets.bottom, 0],
        });
      case "center":
        return process.current.interpolate({
          inputRange: [0, 1],
          outputRange: [
            (areaLayout?.height ?? 0) -
              (layout?.y ?? 0) +
              safeAreaInsets.bottom,
            0,
          ],
        });
      case "bottom":
        return process.current.interpolate({
          inputRange: [0, 1],
          outputRange: [(layout?.height ?? 0) + safeAreaInsets.bottom, 0],
        });
    }
  }, [align, areaLayout, safeAreaInsets.bottom, layout]);

  useEffect(() => {
    if (isOpen) {
      Animated.timing(process.current, {
        toValue: 1,
        duration: openTransitionDuration ?? transitionDuration,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(process.current, {
        toValue: 0,
        duration: closeTransitionDuration ?? transitionDuration,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        if (closeTransitionRef.current) {
          closeTransitionRef.current();
        }
      });
    }
  }, [
    closeTransitionDuration,
    isOpen,
    openTransitionDuration,
    transitionDuration,
  ]);

  return (
    <View style={style.flatten(["absolute-fill", "overflow-visible"])}>
      <SafeAreaView
        style={style.flatten(
          ["flex-1", "overflow-visible"],
          [
            align === "center" && "justify-center",
            align === "top" && "justify-start",
            align === "bottom" && "justify-end",
          ]
        )}
        onLayout={(e) => {
          setAreaLayout(e.nativeEvent.layout);
        }}
      >
        <Animated.View
          onLayout={(e) => {
            setLayout(e.nativeEvent.layout);
          }}
          style={{
            transform: [{ translateY: paddingTopAnimated }],
            opacity: layout && areaLayout ? 1 : 0,
          }}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};
