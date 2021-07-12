import React, { FunctionComponent, useMemo, useState } from "react";
import Svg, { Path } from "react-native-svg";
import Animated, { Clock, Easing } from "react-native-reanimated";

export const SVGLoadingIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  // This icon is used for only development phase.
  // Actual icon for the production is not yet decided.
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 18 18"
      width={size}
      height={size}
    >
      <Path
        fill={color}
        d="M5.376 0a.855.855 0 00-.59.189 1.68 1.68 0 00-.542.518c-.334.471-.558 1.178-.558 2.215 0 .472.032.974.112 1.477a9.91 9.91 0 00-1.371.409c-.654.251-1.212.549-1.642.942-.431.393-.749.896-.781 1.477-.032.487.143.974.43 1.32.287.345.622.581 1.005.832a.77.77 0 001.036-.204c.223-.33.127-.785-.207-1.021-.351-.22-.574-.408-.67-.518l-.007-.009c-.089-.118-.104-.137-.089-.321 0-.11.064-.267.303-.472.239-.22.638-.455 1.18-.66a7.92 7.92 0 011.116-.329c.127.502.271 1.005.462 1.523-1.116 1.933-1.642 3.661-1.626 5.044.016.832.112 1.744.925 2.262.478.314 1.052.346 1.514.267.38-.08.714-.217 1.021-.343l.159-.065a.705.705 0 00.462-.582.738.738 0 00-.287-.691.753.753 0 00-.749-.078c-.367.157-.685.282-.893.314-.207.047-.287.031-.414-.047-.048-.032-.239-.409-.255-1.069-.016-.769.255-1.901.861-3.236.956 1.948 2.152 3.582 3.331 4.682.606.565 1.212.99 1.818 1.241.622.251 1.307.346 1.913.047l.048-.016.032-.031c.573-.377.765-1.006.845-1.634.079-.613.031-1.304-.064-2.011-.208-1.43-.654-2.954-1.052-4.038a.729.729 0 00-.574-.487.767.767 0 00-.718.252.727.727 0 00-.111.738c.366.99.797 2.467.972 3.739.096.629.112 1.226.064 1.634-.048.377-.144.503-.191.534-.096.032-.255.063-.59-.078-.367-.157-.861-.487-1.387-.959-1.02-.942-2.168-2.498-3.045-4.32-.16-.314-.287-.644-.415-.974a21.462 21.462 0 011.324-1.996c.32 0 .655.015 1.004.03l.048.002c2.056.11 3.937.534 5.229 1.084.637.283 1.148.597 1.435.864.286.267.35.456.334.566-.016.251-.287.565-.956.754a.732.732 0 00-.51.911.746.746 0 00.924.503c1.021-.299 1.961-1.006 2.009-2.09.032-.66-.319-1.241-.797-1.697-.478-.455-1.116-.817-1.865-1.147-1.499-.644-3.476-1.084-5.66-1.209.351-.362.702-.707 1.036-.99.973-.833 1.898-1.241 2.312-1.257.16 0 .239.016.303.063.128.078.159.141.175.298.016.158-.032.425-.223.755a.688.688 0 000 .738c.128.236.383.361.654.361s.51-.141.637-.377c.303-.518.463-1.068.415-1.618A1.88 1.88 0 0013.14.628 2.046 2.046 0 0011.976.33c-1.068.047-2.12.66-3.22 1.602a15.888 15.888 0 00-2.009 2.074c-.51.016-1.02.063-1.498.11a8.372 8.372 0 01-.096-1.225c0-.833.175-1.226.287-1.383l.048-.047c.43.032.606.157 1.036.534a.76.76 0 001.052-.078A.735.735 0 007.497.88C7.018.503 6.365 0 5.376 0zm.223 5.562a.444.444 0 01-.024.039l-.023.039c0-.008-.004-.019-.008-.031s-.008-.024-.008-.032c.008 0 .02-.004.032-.007a.11.11 0 01.031-.008zm1.786 2.089c0-.612.51-1.099 1.116-1.099.606 0 1.116.487 1.116 1.099 0 .613-.494 1.1-1.116 1.1a1.101 1.101 0 01-1.116-1.1z"
        transform="translate(.5 1.35)"
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
