import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import Animated, { Easing } from "react-native-reanimated";

export interface ModalBaseProps {
  align?: "top" | "center" | "bottom";
  isOpen: boolean;
  transitionDuration?: number;
  openTransitionDuration?: number;
  closeTransitionDuration?: number;
  onOpenTransitionEnd?: () => void;
  onCloseTransitionEnd?: () => void;

  containerStyle?: ViewStyle;
  disableSafeArea?: boolean;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  children,
  align = "bottom",
  isOpen,
  transitionDuration = 300,
  openTransitionDuration,
  closeTransitionDuration,
  onOpenTransitionEnd,
  onCloseTransitionEnd,
  containerStyle,
  disableSafeArea,
}) => {
  const style = useStyle();

  const openTransitionRef = useRef(onOpenTransitionEnd);
  openTransitionRef.current = onOpenTransitionEnd;
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

  const process = useRef(new Animated.Value<number>(0));

  const paddingTopAnimated = useMemo(() => {
    switch (align) {
      case "top":
        return process.current.interpolate({
          inputRange: [0, 1],
          outputRange: [areaLayout?.height ?? 0, 0],
        });
      case "center":
        return process.current.interpolate({
          inputRange: [0, 1],
          outputRange: [(areaLayout?.height ?? 0) - (layout?.y ?? 0)],
        });
      case "bottom":
        return process.current.interpolate({
          inputRange: [0, 1],
          outputRange: [layout?.height ?? 0, 0],
        });
    }
  }, [align, areaLayout, layout]);

  useEffect(() => {
    if (isOpen) {
      const duration = openTransitionDuration ?? transitionDuration;
      if (duration) {
        Animated.timing(process.current, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
        }).start(() => {
          if (openTransitionRef.current) {
            openTransitionRef.current();
          }
        });
      } else {
        process.current.setValue(1);
      }
    } else {
      const duration = closeTransitionDuration ?? transitionDuration;
      if (duration) {
        Animated.timing(process.current, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
        }).start(() => {
          if (closeTransitionRef.current) {
            closeTransitionRef.current();
          }
        });
      } else {
        process.current.setValue(0);
      }
    }
  }, [
    closeTransitionDuration,
    isOpen,
    openTransitionDuration,
    transitionDuration,
  ]);

  return (
    <View
      style={style.flatten(["absolute-fill", "overflow-visible"])}
      pointerEvents="box-none"
    >
      {!disableSafeArea ? (
        <SafeAreaView
          style={style.flatten(
            ["flex-1", "overflow-visible"],
            [
              align === "center" && "justify-center",
              align === "top" && "justify-start",
              align === "bottom" && "justify-end",
            ]
          )}
          pointerEvents="box-none"
          onLayout={(e) => {
            setAreaLayout(e.nativeEvent.layout);
          }}
        >
          <Animated.View
            onLayout={(e) => {
              setLayout(e.nativeEvent.layout);
            }}
            style={StyleSheet.flatten([
              {
                transform: [{ translateY: paddingTopAnimated }],
                opacity: layout && areaLayout ? 1 : 0,
              },
              containerStyle,
            ])}
          >
            {children}
          </Animated.View>
        </SafeAreaView>
      ) : (
        <View
          style={style.flatten(
            ["flex-1", "overflow-visible"],
            [
              align === "center" && "justify-center",
              align === "top" && "justify-start",
              align === "bottom" && "justify-end",
            ]
          )}
          pointerEvents="box-none"
          onLayout={(e) => {
            setAreaLayout(e.nativeEvent.layout);
          }}
        >
          <Animated.View
            onLayout={(e) => {
              setLayout(e.nativeEvent.layout);
            }}
            style={StyleSheet.flatten([
              {
                transform: [{ translateY: paddingTopAnimated }],
                opacity: layout && areaLayout ? 1 : 0,
              },
              containerStyle,
            ])}
          >
            {children}
          </Animated.View>
        </View>
      )}
    </View>
  );
};
