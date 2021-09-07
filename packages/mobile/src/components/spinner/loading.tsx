import React, { FunctionComponent, useMemo, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, { Clock, Easing } from "react-native-reanimated";

export const SVGLoadingIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 17 17">
      <Circle cx="8.5" cy="1.5" r="1.5" fill={color} />
      <Circle cx="8.5" cy="15.5" r="1.5" fill={color} opacity="0.4" />
      <Circle
        cx="15.5"
        cy="8.5"
        r="1.5"
        fill={color}
        opacity="0.1"
        transform="rotate(90 15.5 8.5)"
      />
      <Circle
        cx="1.5"
        cy="8.5"
        r="1.5"
        fill={color}
        opacity="0.75"
        transform="rotate(90 1.5 8.5)"
      />
      <Circle
        cx="3.55"
        cy="13.45"
        r="1.5"
        fill={color}
        opacity="0.55"
        transform="rotate(45 3.55 13.45)"
      />
      <Circle
        cx="13.45"
        cy="13.45"
        r="1.5"
        fill={color}
        opacity="0.25"
        transform="rotate(135 13.45 13.45)"
      />
      <Circle
        cx="3.551"
        cy="3.55"
        r="1.5"
        fill={color}
        opacity="0.9"
        transform="rotate(135 3.55 3.55)"
      />
    </Svg>
  );
};

export const LoadingSpinner: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  const [spinClock] = useState(() => new Clock());
  const [spinClockState] = useState(() => {
    return {
      finished: new Animated.Value(0),
      position: new Animated.Value(0),
      time: new Animated.Value(0),
      frameTime: new Animated.Value(0),
    };
  });
  const [animConfig] = useState(() => {
    return {
      duration: 1200,
      toValue: 360,
      easing: Easing.linear,
    };
  });

  // Loop infinitely
  const spinAnimated = useMemo(() => {
    return Animated.block([
      // start right away
      Animated.startClock(spinClock),
      // process state
      Animated.timing(spinClock, spinClockState, animConfig),
      // when over (processed by timing at the end)
      Animated.cond(spinClockState.finished, [
        // we stop
        Animated.stopClock(spinClock),
        // set flag ready to be restarted
        Animated.set(spinClockState.finished, 0),
        // same value as the initial defined in the state creation
        Animated.set(spinClockState.position, 0),
        // very important to reset this ones
        Animated.set(spinClockState.time, 0),
        Animated.set(spinClockState.frameTime, 0),
        // and we restart
        Animated.startClock(spinClock),
      ]),
      spinClockState.position,
    ]);
  }, [animConfig, spinClock, spinClockState]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [
          {
            rotate: Animated.divide(
              Animated.multiply(spinAnimated, Math.PI),
              180
            ),
          },
        ],
      }}
    >
      <SVGLoadingIcon color={color} size={size} />
    </Animated.View>
  );
};
