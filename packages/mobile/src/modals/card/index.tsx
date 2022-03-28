import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardEvent,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useModalState, useModalTransision } from "../base";
import Animated, { Easing } from "react-native-reanimated";
import {
  DefaultAcceleration,
  DefaultCloseVelocity,
  DefaultOpenVelocity,
} from "../base/const";

const useAnimatedValueSet = () => {
  const [state] = useState(() => {
    return {
      clock: new Animated.Clock(),
      finished: new Animated.Value(0),
      time: new Animated.Value(0),
      frameTime: new Animated.Value(0),
      value: new Animated.Value(0),
    };
  });

  return state;
};

// CONTRACT: Use with { disableSafeArea: true, align: "bottom" } modal options.
export const CardModal: FunctionComponent<{
  title?: string;
  right?: React.ReactElement;
  childrenContainerStyle?: ViewStyle;

  disableGesture?: boolean;
}> = ({
  title,
  right,
  children,
  childrenContainerStyle,
  disableGesture = false,
}) => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  const [
    softwareKeyboardBottomPadding,
    setSoftwareKeyboardBottomPadding,
  ] = useState(0);

  useEffect(() => {
    const onKeyboarFrame = (e: KeyboardEvent) => {
      setSoftwareKeyboardBottomPadding(
        e.endCoordinates.height - safeAreaInsets.bottom
      );
    };
    const onKeyboardClearFrame = () => {
      setSoftwareKeyboardBottomPadding(0);
    };

    // No need to do this on android
    if (Platform.OS !== "android") {
      Keyboard.addListener("keyboardWillShow", onKeyboarFrame);
      Keyboard.addListener("keyboardWillChangeFrame", onKeyboarFrame);
      Keyboard.addListener("keyboardWillHide", onKeyboardClearFrame);

      return () => {
        Keyboard.removeListener("keyboardWillShow", onKeyboarFrame);
        Keyboard.removeListener("keyboardWillChangeFrame", onKeyboarFrame);
        Keyboard.removeListener("keyboardWillHide", onKeyboardClearFrame);
      };
    }
  }, [safeAreaInsets.bottom]);

  const animatedValueSet = useAnimatedValueSet();

  const modal = useModalState();
  const modalTransition = useModalTransision();

  const animatedKeyboardPaddingBottom = useMemo(() => {
    return Animated.block([
      Animated.cond(
        Animated.and(
          Animated.neq(animatedValueSet.value, softwareKeyboardBottomPadding),
          Animated.not(Animated.clockRunning(animatedValueSet.clock))
        ),
        [
          Animated.debug(
            "start clock for keyboard avoiding",
            animatedValueSet.value
          ),
          Animated.set(animatedValueSet.finished, 0),
          Animated.set(animatedValueSet.time, 0),
          Animated.set(animatedValueSet.frameTime, 0),
          Animated.startClock(animatedValueSet.clock),
        ]
      ),
      Animated.timing(
        animatedValueSet.clock,
        {
          finished: animatedValueSet.finished,
          position: animatedValueSet.value,
          time: animatedValueSet.time,
          frameTime: animatedValueSet.frameTime,
        },
        {
          toValue: softwareKeyboardBottomPadding,
          duration: 175,
          easing: Easing.linear,
        }
      ),
      Animated.cond(
        animatedValueSet.finished,
        Animated.stopClock(animatedValueSet.clock)
      ),
      animatedValueSet.value,
    ]);
  }, [
    animatedValueSet.clock,
    animatedValueSet.finished,
    animatedValueSet.frameTime,
    animatedValueSet.time,
    animatedValueSet.value,
    softwareKeyboardBottomPadding,
  ]);

  const [startTranslateY] = useState(() => new Animated.Value(0));
  const [openVelocityValue] = useState(() => new Animated.Value(0));
  const [closeVelocityValue] = useState(() => new Animated.Value(0));
  const [velocityYAcceleration] = useState(() => new Animated.Value(1));

  const onGestureEvent = useMemo(() => {
    const openVelocity =
      modal.openTransitionVelocity ??
      modal.transitionVelocity ??
      DefaultOpenVelocity;
    const closeVelocity =
      modal.closeTransitionVelocity ??
      modal.transitionVelocity ??
      DefaultCloseVelocity;
    const acceleration = modal.transitionAcceleration ?? DefaultAcceleration;

    return Animated.event([
      {
        nativeEvent: ({
          velocityY,
          translationY,
          state,
        }: {
          velocityY: number;
          translationY: number;
          state: number;
        }) => {
          return Animated.block([
            Animated.cond(
              // Check that the state is BEGEN or ACTIVE.
              Animated.and(
                Animated.or(Animated.eq(state, 2), Animated.eq(state, 4)),
                modalTransition.isOpen
              ),
              [
                // When the tocuh is active, but the "isPaused" is 0, it would be the case that the status is changed and first enter.
                // So, this time is enough to set the starting translation Y position.
                Animated.cond(
                  modalTransition.isPaused,
                  0,
                  Animated.set(startTranslateY, modalTransition.translateY)
                ),
                // If touch is active, set the "isPaused" as 1 to prevent the transition.
                Animated.set(modalTransition.isPaused, 1),
                // Set the translationY on the modal transition.
                Animated.set(
                  modalTransition.translateY,
                  Animated.add(startTranslateY, translationY)
                ),
                // TranslationY on the modal transition can be negative.
                Animated.cond(
                  Animated.lessOrEq(modalTransition.translateY, 0),
                  Animated.set(modalTransition.translateY, 0)
                ),
                // Set the velocityYAcceleration
                Animated.set(
                  velocityYAcceleration,
                  // velocityYAcceleration should be between 1 ~ 2.
                  // And, velocityYAcceleration is the velocityY / 1750
                  Animated.max(
                    1,
                    Animated.min(
                      2,
                      Animated.divide(Animated.abs(velocityY), 1750)
                    )
                  )
                ),
              ],
              // If the status is not active, and the "isPaused" is not yet changed to the 1,
              // it means that the it is the first time from the status is changed.
              Animated.cond(modalTransition.isPaused, [
                // If the remaining closing translateY (startY - translateY) is lesser or equal than 250,
                // or "velocityY" from gesture is greater or equal than 100, try to close the modal.
                // Else, just return to the open status.
                Animated.cond(
                  Animated.not(
                    Animated.or(
                      Animated.and(
                        Animated.lessOrEq(
                          Animated.abs(
                            Animated.sub(
                              modalTransition.translateY,
                              modalTransition.startY
                            )
                          ),
                          250
                        ),
                        Animated.greaterOrEq(velocityY, -30)
                      ),
                      Animated.greaterOrEq(velocityY, 100)
                    )
                  ),
                  [
                    [
                      Animated.stopClock(modalTransition.clock),
                      Animated.set(modalTransition.finished, 0),
                      Animated.set(modalTransition.time, 0),
                      // No need to set.
                      // Animated.set(modalTransition.translateY, transition.startY),
                      Animated.set(modalTransition.frameTime, 0),
                      Animated.startClock(modalTransition.clock),
                    ],
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
                                acceleration,
                                Animated.divide(
                                  Animated.abs(modalTransition.translateY),
                                  100
                                )
                              )
                            )
                          )
                        ),
                        Animated.set(
                          openVelocityValue,
                          Animated.multiply(
                            openVelocityValue,
                            velocityYAcceleration
                          )
                        ),
                        Animated.debug(
                          "velocityYAcceleration",
                          velocityYAcceleration
                        ),
                        Animated.set(
                          modalTransition.duration,
                          Animated.multiply(
                            Animated.divide(
                              Animated.abs(modalTransition.translateY),
                              openVelocityValue
                            ),
                            1000
                          )
                        ),
                      ],
                      Animated.set(modalTransition.duration, 0)
                    ),
                    Animated.set(modalTransition.durationSetOnExternal, 1),
                    Animated.set(modalTransition.isOpen, 1),
                  ],
                  [
                    [
                      Animated.stopClock(modalTransition.clock),
                      Animated.set(modalTransition.finished, 0),
                      Animated.set(modalTransition.time, 0),
                      // No need to set.
                      // Animated.set(modalTransition.translateY, transition.startY),
                      Animated.set(modalTransition.frameTime, 0),
                      Animated.startClock(modalTransition.clock),
                    ],
                    // Set the duration
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
                                acceleration,
                                Animated.divide(
                                  Animated.abs(
                                    Animated.sub(
                                      modalTransition.translateY,
                                      modalTransition.startY
                                    )
                                  ),
                                  100
                                )
                              )
                            )
                          )
                        ),
                        Animated.set(
                          closeVelocityValue,
                          Animated.multiply(
                            closeVelocityValue,
                            velocityYAcceleration
                          )
                        ),
                        Animated.debug(
                          "velocityYAcceleration",
                          velocityYAcceleration
                        ),
                        Animated.set(
                          modalTransition.duration,
                          Animated.multiply(
                            Animated.divide(
                              Animated.abs(
                                Animated.sub(
                                  modalTransition.translateY,
                                  modalTransition.startY
                                )
                              ),
                              closeVelocityValue
                            ),
                            1000
                          )
                        ),
                      ],
                      Animated.set(modalTransition.duration, 0)
                    ),
                    Animated.set(modalTransition.durationSetOnExternal, 1),
                    Animated.set(modalTransition.isOpen, 0),
                    Animated.call([], () => {
                      modal.close();
                    }),
                  ]
                ),
                Animated.set(modalTransition.isPaused, 0),
              ])
            ),
          ]);
        },
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modal.close,
    modal.closeTransitionVelocity,
    modal.openTransitionVelocity,
    modal.transitionVelocity,
    modalTransition.clock,
    modalTransition.duration,
    modalTransition.finished,
    modalTransition.frameTime,
    modalTransition.isOpen,
    modalTransition.isPaused,
    modalTransition.time,
    modalTransition.translateY,
    modalTransition.startY,
    startTranslateY,
  ]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        style.flatten([
          "background-color-white",
          "border-radius-top-left-8",
          "border-radius-top-right-8",
          "overflow-hidden",
        ]),
        {
          paddingBottom: Animated.add(
            safeAreaInsets.bottom,
            animatedKeyboardPaddingBottom
          ),
        },
      ])}
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
        enabled={!disableGesture}
      >
        {/* Below view is not animated, but to let the gesture handler to accept the animated block, you should set the children of the gesture handler as the Animated.View */}
        <Animated.View style={style.flatten(["padding-x-page"])}>
          <View style={style.flatten(["items-center", "margin-bottom-16"])}>
            {!disableGesture ? (
              <View
                style={style.flatten([
                  "margin-top-8",
                  "width-58",
                  "height-5",
                  "border-radius-16",
                  "background-color-card-modal-handle",
                ])}
              />
            ) : null}
          </View>
          {title ? (
            <React.Fragment>
              <View
                style={style.flatten([
                  "flex-row",
                  "items-center",
                  "margin-bottom-16",
                ])}
              >
                <Text style={style.flatten(["h4", "color-text-black-high"])}>
                  {title}
                </Text>
                {right}
              </View>
              <View
                style={style.flatten([
                  "height-1",
                  "background-color-border-white",
                ])}
              />
            </React.Fragment>
          ) : null}
        </Animated.View>
      </PanGestureHandler>
      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-page", "padding-top-16"]),
          childrenContainerStyle,
        ])}
      >
        {children}
      </View>
    </Animated.View>
  );
};
