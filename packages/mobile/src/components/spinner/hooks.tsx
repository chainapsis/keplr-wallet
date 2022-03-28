import { useMemo, useState } from "react";
import Animated, { Clock, Easing } from "react-native-reanimated";

export const useSpinAnimated = (enabled: boolean) => {
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
  return useMemo(() => {
    const numEnabled = enabled ? 1 : 0;

    return Animated.block([
      Animated.cond(
        numEnabled,
        [
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
        ],
        [
          // Stop and clear
          Animated.cond(Animated.clockRunning(spinClock), [
            Animated.stopClock(spinClock),
            // set flag ready to be restarted
            Animated.set(spinClockState.finished, 0),
            // same value as the initial defined in the state creation
            Animated.set(spinClockState.position, 0),
            // very important to reset this ones
            Animated.set(spinClockState.time, 0),
            Animated.set(spinClockState.frameTime, 0),
          ]),
          Animated.set(spinClockState.position, 0),
        ]
      ),
      Animated.divide(Animated.multiply(spinClockState.position, Math.PI), 180),
    ]);
  }, [animConfig, enabled, spinClock, spinClockState]);
};
