import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStyle } from "../../../styles";
import Animated, { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModalTransision } from "./transition";
import { DefaultVelocity } from "./const";

export interface ModalBaseProps {
  align?: "top" | "center" | "bottom";
  isOpen: boolean;
  transitionVelocity?: number;
  openTransitionVelocity?: number;
  closeTransitionVelocity?: number;
  onOpenTransitionEnd?: () => void;
  onCloseTransitionEnd?: () => void;

  containerStyle?: ViewStyle;
  disableSafeArea?: boolean;
}

const usePreviousDiff = () => {
  const [previous] = useState(() => new Animated.Value<number>());

  return useMemo(() => {
    return {
      set: (value: Animated.Adaptable<number>) => Animated.set(previous, value),
      diff: (value: Animated.Adaptable<number>) =>
        Animated.cond(
          Animated.defined(previous),
          Animated.sub(value, previous),
          value
        ),
      previous,
    };
  }, [previous]);
};

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  children,
  align = "bottom",
  isOpen,
  transitionVelocity = DefaultVelocity,
  openTransitionVelocity,
  closeTransitionVelocity,
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

  const [containerLayout, setContainerLayout] = useState<
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

  const safeAreaInsets = useSafeAreaInsets();

  const transition = useModalTransision();

  useEffect(() => {
    switch (align) {
      case "top":
        transition.startY.setValue(
          -((layout?.height ?? 0) + (disableSafeArea ? 0 : safeAreaInsets.top))
        );
        return;
      case "center":
        transition.startY.setValue(
          (containerLayout ? containerLayout.height / 2 : 0) +
            (layout ? layout.height / 2 : 0)
        );
        return;
      case "bottom":
        transition.startY.setValue(
          (layout?.height ?? 0) + (disableSafeArea ? 0 : safeAreaInsets.bottom)
        );
        return;
    }
  }, [
    align,
    containerLayout,
    disableSafeArea,
    layout,
    safeAreaInsets.top,
    safeAreaInsets.bottom,
    transition.startY,
  ]);

  useEffect(() => {
    if (isOpen) {
      transition.isOpen.setValue(1);
    } else {
      transition.isOpen.setValue(-1);
    }
  }, [isOpen, transition.isOpen]);

  const previousDiff = usePreviousDiff();

  const translateY = useMemo(() => {
    if (!layout || !containerLayout) {
      return new Animated.Value(0);
    }

    const openVelocity = openTransitionVelocity ?? transitionVelocity;
    const closeVelocity = closeTransitionVelocity ?? transitionVelocity;

    return Animated.block([
      Animated.cond(transition.isPaused, [
        Animated.debug("is paused", transition.isPaused),
        Animated.debug("translateY", transition.translateY),
      ]),
      Animated.cond(
        Animated.and(
          Animated.defined(transition.startY),
          Animated.not(transition.isPaused)
        ),
        [
          Animated.cond(
            Animated.defined(previousDiff.previous),
            Animated.debug("before previous", previousDiff.previous),
            Animated.debug("before previous undefined", new Animated.Value(0))
          ),
          Animated.debug(
            `modal "isOpen" diff`,
            previousDiff.diff(transition.isOpen)
          ),
          Animated.cond(
            Animated.greaterThan(previousDiff.diff(transition.isOpen), 0),
            [
              Animated.debug("modal will open", transition.clock),
              // When the modal is opened,
              [
                Animated.stopClock(transition.clock),
                Animated.set(transition.finished, 0),
                Animated.set(transition.time, 0),
                Animated.set(transition.translateY, transition.startY),
                Animated.set(transition.frameTime, 0),
                Animated.startClock(transition.clock),
              ],
              // Set the duration
              Animated.cond(
                Animated.greaterThan(openVelocity, 0),
                Animated.set(
                  transition.duration,
                  Animated.multiply(
                    Animated.divide(
                      Animated.abs(transition.startY),
                      openVelocity
                    ),
                    1000
                  )
                ),
                Animated.set(transition.duration, 0)
              ),
              Animated.debug(
                "open transition initialized",
                Animated.clockRunning(transition.clock)
              ),
              Animated.debug("transition startY", transition.startY),
              Animated.debug("transition duration is", transition.duration),
            ]
          ),
          Animated.cond(
            Animated.lessThan(previousDiff.diff(transition.isOpen), 0),
            [
              Animated.debug("modal will close", transition.clock),
              // When the modal is closed,
              [
                Animated.stopClock(transition.clock),
                Animated.set(transition.finished, 0),
                Animated.set(transition.time, 0),
                // No need to reset the `translateY`, just remain it.
                // Animated.set(transition.translateY, 0),
                Animated.set(transition.frameTime, 0),
                Animated.startClock(transition.clock),
              ],
              // Set the duration
              Animated.cond(
                Animated.greaterThan(closeVelocity, 0),
                Animated.set(
                  transition.duration,
                  Animated.multiply(
                    Animated.divide(
                      Animated.abs(
                        Animated.sub(transition.translateY, transition.startY)
                      ),
                      closeVelocity
                    ),
                    1000
                  )
                ),
                Animated.set(transition.duration, 0)
              ),
              Animated.debug(
                "close transition initialized",
                Animated.clockRunning(transition.clock)
              ),
              Animated.debug("transition startY", transition.startY),
              Animated.debug("transition duration is", transition.duration),
            ]
          ),
          Animated.cond(
            Animated.greaterThan(transition.isOpen, 0),
            Animated.cond(
              Animated.greaterThan(transition.duration, 0),
              [
                Animated.debug(
                  "start open transion with duration",
                  transition.duration
                ),
                Animated.timing(
                  transition.clock,
                  {
                    finished: transition.finished,
                    position: transition.translateY,
                    time: transition.time,
                    frameTime: transition.frameTime,
                  },
                  {
                    toValue: 0,
                    duration: transition.duration,
                    easing: Easing.out(Easing.cubic),
                  }
                ),
                Animated.cond(
                  transition.finished,
                  Animated.stopClock(transition.clock)
                ),
                Animated.cond(
                  Animated.diff(transition.finished),
                  Animated.call([], () => {
                    console.log("modal callback open");
                    if (openTransitionRef.current) {
                      openTransitionRef.current();
                    }
                  })
                ),
                Animated.debug(
                  "open duration clock is running",
                  Animated.clockRunning(transition.clock)
                ),
                Animated.debug("open duration clock", transition.clock),
                Animated.debug("open duration finished", transition.finished),
                Animated.debug("open duration time", transition.time),
                Animated.debug("open duration frameTime", transition.frameTime),
                Animated.debug(
                  "open duration transalteY",
                  transition.translateY
                ),
              ],
              [
                Animated.debug(
                  "immediately do open transition",
                  transition.duration
                ),
                Animated.stopClock(transition.clock),
                Animated.set(transition.translateY, 0),
                Animated.call([], () => {
                  console.log("modal callback open");
                  if (openTransitionRef.current) {
                    openTransitionRef.current();
                  }
                }),
              ]
            ),
            Animated.cond(
              Animated.greaterThan(transition.duration, 0),
              [
                Animated.debug(
                  "start close transion with duration",
                  transition.duration
                ),
                Animated.timing(
                  transition.clock,
                  {
                    finished: transition.finished,
                    position: transition.translateY,
                    time: transition.time,
                    frameTime: transition.frameTime,
                  },
                  {
                    toValue: transition.startY,
                    duration: transition.duration,
                    easing: Easing.out(Easing.cubic),
                  }
                ),
                Animated.cond(
                  transition.finished,
                  Animated.stopClock(transition.clock)
                ),
                Animated.cond(
                  Animated.diff(transition.finished),
                  Animated.call([], () => {
                    console.log("modal callback close");
                    if (closeTransitionRef.current) {
                      closeTransitionRef.current();
                    }
                  })
                ),
                Animated.debug(
                  "close duration clock is running",
                  Animated.clockRunning(transition.clock)
                ),
                Animated.debug("close duration clock", transition.clock),
                Animated.debug("close duration finished", transition.finished),
                Animated.debug("close duration time", transition.time),
                Animated.debug(
                  "close duration frameTime",
                  transition.frameTime
                ),
                Animated.debug(
                  "close duration transalteY",
                  transition.translateY
                ),
              ],
              [
                Animated.debug(
                  "immediately do close transition",
                  transition.duration
                ),
                Animated.stopClock(transition.clock),
                Animated.set(transition.translateY, transition.startY),
                Animated.call([], () => {
                  console.log("modal callback close");
                  if (closeTransitionRef.current) {
                    closeTransitionRef.current();
                  }
                }),
              ]
            )
          ),
          previousDiff.set(transition.isOpen),
          Animated.debug("after previous", previousDiff.previous),
        ]
      ),
      transition.translateY,
    ]);
  }, [
    layout,
    containerLayout,
    openTransitionVelocity,
    transitionVelocity,
    closeTransitionVelocity,
    transition.isPaused,
    transition.translateY,
    transition.startY,
    transition.isOpen,
    transition.clock,
    transition.finished,
    transition.time,
    transition.frameTime,
    transition.duration,
    previousDiff,
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
            setContainerLayout(e.nativeEvent.layout);
          }}
        >
          <Animated.View
            onLayout={(e) => {
              setLayout(e.nativeEvent.layout);
            }}
            style={StyleSheet.flatten([
              {
                transform: [{ translateY }],
                opacity: layout && containerLayout ? 1 : 0,
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
            setContainerLayout(e.nativeEvent.layout);
          }}
        >
          <Animated.View
            onLayout={(e) => {
              setLayout(e.nativeEvent.layout);
            }}
            style={StyleSheet.flatten([
              {
                transform: [{ translateY }],
                opacity: layout && containerLayout ? 1 : 0,
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
