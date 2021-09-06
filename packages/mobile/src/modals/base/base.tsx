import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStyle } from "../../styles";
import Animated, { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModalTransision } from "./transition";
import {
  DefaultAcceleration,
  DefaultCloseVelocity,
  DefaultOpenVelocity,
  OpenMinDuration,
  CloseMinDuration,
} from "./const";

export interface ModalBaseProps {
  align?: "top" | "center" | "bottom";
  isOpen: boolean;
  transitionVelocity?: number;
  openTransitionVelocity?: number;
  closeTransitionVelocity?: number;
  // Acceleration based on 100
  transitionAcceleration?: number;
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
  transitionVelocity,
  openTransitionVelocity,
  closeTransitionVelocity,
  transitionAcceleration = DefaultAcceleration,
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
        break;
      case "center":
        transition.startY.setValue(
          (containerLayout ? containerLayout.height / 2 : 0) +
            (layout ? layout.height / 2 : 0)
        );
        break;
      case "bottom":
        transition.startY.setValue(
          (layout?.height ?? 0) + (disableSafeArea ? 0 : safeAreaInsets.bottom)
        );
        break;
    }

    if (layout && containerLayout) {
      // Initialization is complete.
      transition.isInitialized.setValue(1);
    }
  }, [
    align,
    containerLayout,
    disableSafeArea,
    layout,
    safeAreaInsets.top,
    safeAreaInsets.bottom,
    transition.startY,
    transition.isInitialized,
  ]);

  useEffect(() => {
    if (isOpen) {
      transition.isOpen.setValue(1);
    } else {
      transition.isOpen.setValue(-1);
    }
  }, [isOpen, transition.isOpen]);

  const previousDiff = usePreviousDiff();
  const [openCallbackOnce] = useState(() => new Animated.Value(0));
  const [closeCallbackOnce] = useState(() => new Animated.Value(0));

  const opacity = useMemo(() => {
    // Opacity is used to hide the modal until initialization complete
    // Actually, it is not used for animating.

    return Animated.block([
      Animated.cond(
        Animated.and(
          transition.isInitialized,
          Animated.greaterThan(Animated.abs(transition.startY), 0)
        ),
        new Animated.Value(1),
        new Animated.Value(0)
      ),
    ]);
  }, [transition.isInitialized, transition.startY]);

  const [openVelocityValue] = useState(() => new Animated.Value(0));
  const [closeVelocityValue] = useState(() => new Animated.Value(0));

  const translateY = useMemo(() => {
    const openVelocity =
      openTransitionVelocity ?? transitionVelocity ?? DefaultOpenVelocity;
    const closeVelocity =
      closeTransitionVelocity ?? transitionVelocity ?? DefaultCloseVelocity;

    return Animated.block([
      Animated.cond(Animated.not(transition.isInitialized), [
        Animated.debug("not yet initialized", transition.isInitialized),
      ]),
      Animated.cond(transition.isPaused, [
        Animated.debug("is paused", transition.isPaused),
        Animated.debug("translateY", transition.translateY),
      ]),
      Animated.cond(
        Animated.and(
          Animated.greaterThan(Animated.abs(transition.startY), 0),
          transition.isInitialized,
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
              Animated.cond(
                Animated.eq(transition.durationSetOnExternal, 0),
                [
                  // Set the duration
                  Animated.cond(
                    Animated.greaterThan(openVelocity, 0),
                    [
                      Animated.set(
                        openVelocityValue,
                        Animated.max(
                          openVelocity,
                          Animated.multiply(
                            openVelocity,
                            Animated.pow(
                              transitionAcceleration,
                              Animated.divide(
                                Animated.abs(transition.startY),
                                100
                              )
                            )
                          )
                        )
                      ),
                      Animated.set(
                        transition.duration,
                        Animated.max(
                          Animated.multiply(
                            Animated.divide(
                              Animated.abs(transition.startY),
                              openVelocityValue
                            ),
                            1000
                          ),
                          OpenMinDuration
                        )
                      ),
                    ],
                    Animated.set(transition.duration, 0)
                  ),
                  Animated.debug(
                    "open transition initialized",
                    Animated.clockRunning(transition.clock)
                  ),
                  Animated.debug("transition startY", transition.startY),
                  Animated.debug("transition duration is", transition.duration),
                ],
                Animated.debug("duration set on external", transition.duration)
              ),
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
              Animated.cond(
                Animated.eq(transition.durationSetOnExternal, 0), // Set the duration
                [
                  Animated.cond(
                    Animated.greaterThan(closeVelocity, 0),
                    [
                      Animated.set(
                        closeVelocityValue,
                        Animated.max(
                          closeVelocity,
                          Animated.multiply(
                            closeVelocity,
                            Animated.pow(
                              transitionAcceleration,
                              Animated.divide(
                                Animated.abs(
                                  Animated.sub(
                                    transition.translateY,
                                    transition.startY
                                  )
                                ),
                                100
                              )
                            )
                          )
                        )
                      ),
                      Animated.set(
                        transition.duration,
                        Animated.max(
                          Animated.multiply(
                            Animated.divide(
                              Animated.abs(
                                Animated.sub(
                                  transition.translateY,
                                  transition.startY
                                )
                              ),
                              closeVelocityValue
                            ),
                            1000
                          ),
                          CloseMinDuration
                        )
                      ),
                    ],
                    Animated.set(transition.duration, 0)
                  ),
                  Animated.debug(
                    "close transition initialized",
                    Animated.clockRunning(transition.clock)
                  ),
                  Animated.debug("transition startY", transition.startY),
                  Animated.debug("transition duration is", transition.duration),
                ],
                Animated.debug("duration set on external", transition.duration)
              ),
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
                Animated.cond(transition.finished, [
                  Animated.stopClock(transition.clock),
                  Animated.set(transition.durationSetOnExternal, 0),
                ]),
                Animated.cond(
                  Animated.diff(transition.finished),
                  Animated.cond(Animated.not(openCallbackOnce), [
                    Animated.set(openCallbackOnce, 1),
                    Animated.call([], () => {
                      console.log("modal transition complete callback open");
                      if (openTransitionRef.current) {
                        openTransitionRef.current();
                      }
                    }),
                  ])
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
                Animated.set(transition.durationSetOnExternal, 0),
                Animated.set(transition.translateY, 0),
                Animated.cond(Animated.not(openCallbackOnce), [
                  Animated.set(openCallbackOnce, 1),
                  Animated.call([], () => {
                    console.log(
                      "modal transition complete callback open immediately"
                    );
                    if (openTransitionRef.current) {
                      openTransitionRef.current();
                    }
                  }),
                ]),
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
                    easing: Easing.out(Easing.quad),
                  }
                ),
                Animated.cond(transition.finished, [
                  Animated.stopClock(transition.clock),
                  Animated.set(transition.durationSetOnExternal, 0),
                ]),
                Animated.cond(
                  Animated.diff(transition.finished),
                  Animated.cond(Animated.not(closeCallbackOnce), [
                    Animated.set(closeCallbackOnce, 1),
                    Animated.call([], () => {
                      console.log("modal transition complete callback close");
                      if (closeTransitionRef.current) {
                        closeTransitionRef.current();
                      }
                    }),
                  ])
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
                Animated.set(transition.durationSetOnExternal, 0),
                Animated.set(transition.translateY, transition.startY),
                Animated.cond(Animated.not(closeCallbackOnce), [
                  Animated.set(closeCallbackOnce, 1),
                  Animated.call([], () => {
                    console.log(
                      "modal transition complete callback close immediately"
                    );
                    if (closeTransitionRef.current) {
                      closeTransitionRef.current();
                    }
                  }),
                ]),
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
    openTransitionVelocity,
    transitionVelocity,
    closeTransitionVelocity,
    transition.isInitialized,
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
    openVelocityValue,
    transitionAcceleration,
    closeVelocityValue,
    openCallbackOnce,
    closeCallbackOnce,
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
                opacity,
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
                opacity,
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
