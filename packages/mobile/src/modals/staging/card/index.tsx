import React, { FunctionComponent, useMemo, useState } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useModalState, useModalTransision } from "../base";
import Animated from "react-native-reanimated";
import { DefaultVelocity } from "../base/const";

// CONTRACT: Use with { disableSafeArea: true, align: "bottom" } modal options.
export const CardModal: FunctionComponent<{
  title: string;
  right?: React.ReactElement;
  childrenContainerStyle?: ViewStyle;
}> = ({ title, right, children, childrenContainerStyle }) => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  const modal = useModalState();
  const modalTransition = useModalTransision();

  const [startTranslateY] = useState(() => new Animated.Value(0));

  const onGestureEvent = useMemo(() => {
    const openVelocity =
      modal.openTransitionVelocity ??
      modal.transitionVelocity ??
      DefaultVelocity;
    const closeVelocity =
      modal.closeTransitionVelocity ??
      modal.transitionVelocity ??
      DefaultVelocity;

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
                      Animated.set(
                        modalTransition.duration,
                        Animated.multiply(
                          Animated.divide(
                            Animated.abs(modalTransition.translateY),
                            openVelocity
                          ),
                          1000
                        )
                      ),
                      Animated.set(modalTransition.duration, 0)
                    ),
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
                            closeVelocity
                          ),
                          1000
                        )
                      ),
                      Animated.set(modalTransition.duration, 0)
                    ),
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
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "background-color-white",
          "border-radius-top-left-8",
          "border-radius-top-right-8",
          "overflow-hidden",
        ]),
        {
          paddingBottom: safeAreaInsets.bottom,
        },
      ])}
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
      >
        {/* Below view is not animated, but to let the gesture handler to accept the animated block, you should set the children of the gesture handler as the Animated.View */}
        <Animated.View style={style.flatten(["padding-x-page"])}>
          <View
            style={style.flatten([
              "items-center",
              "margin-top-8",
              "margin-bottom-16",
            ])}
          >
            <View
              style={style.flatten([
                "width-58",
                "height-5",
                "border-radius-16",
                "background-color-card-modal-handle",
              ])}
            />
          </View>
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
            style={style.flatten(["height-1", "background-color-border-white"])}
          />
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
    </View>
  );
};
