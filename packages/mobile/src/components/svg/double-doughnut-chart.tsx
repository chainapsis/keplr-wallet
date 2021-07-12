import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Svg,
} from "react-native-svg";
import Animated, { Easing } from "react-native-reanimated";

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: Animated.Adaptable<number>
): {
  x: Animated.Adaptable<number>;
  y: Animated.Adaptable<number>;
} => {
  const angleInRadians = Animated.divide(
    Animated.multiply(Animated.sub(angleInDegrees, 90), Math.PI),
    180
  );

  return {
    x: Animated.add(
      centerX,
      Animated.multiply(radius, Animated.cos(angleInRadians))
    ),
    y: Animated.add(
      centerY,
      Animated.multiply(radius, Animated.sin(angleInRadians))
    ),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: Animated.Adaptable<number>,
  endAngle: Animated.Adaptable<number>
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = Animated.cond(
    Animated.lessOrEq(Animated.sub(endAngle, startAngle), 180),
    0,
    1
  );

  const d = [
    "M",
    " ",
    start.x,
    " ",
    start.y,
    " ",
    "A",
    " ",
    radius,
    " ",
    radius,
    " ",
    0,
    " ",
    largeArcFlag,
    " ",
    0,
    " ",
    end.x,
    " ",
    end.y,
  ];

  return Animated.concat(...d);
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const DoubleDoughnutChart: FunctionComponent<{
  data: [number, number];
}> = ({ data }) => {
  const centerLocation = 90;
  const radius = 83;

  const firstProcess = useRef(new Animated.Value(0));
  const secondProcess = useRef(new Animated.Value(0));

  const firstData = data[0];
  const secondData = data[1];

  const firstStartDegree = 180;

  const firstEndDegree = useMemo(() => {
    const rate = firstData ? firstData / (firstData + secondData) : 0;
    return 359.9 * rate + firstStartDegree;
  }, [firstData, secondData]);

  const secondEndDegree = useMemo(() => {
    const firstRate = firstData ? firstData / (firstData + secondData) : 0;
    const rate = secondData && secondData > 0 ? 1 - firstRate : 0;
    return 359.9 * rate + firstEndDegree;
  }, [firstData, firstEndDegree, secondData]);

  const firstEndDegreeAnimated = useMemo(() => {
    return firstProcess.current.interpolate({
      inputRange: [0, firstEndDegree],
      outputRange: [0, firstEndDegree],
    });
  }, [firstEndDegree]);

  const secondEndDegreeAnimated = useMemo(() => {
    return secondProcess.current.interpolate({
      inputRange: [0, secondEndDegree],
      outputRange: [0, secondEndDegree],
    });
  }, [secondEndDegree]);

  useEffect(() => {
    Animated.timing(firstProcess.current, {
      toValue: firstEndDegree,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    }).start();
    Animated.timing(secondProcess.current, {
      toValue: secondEndDegree,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [firstEndDegree, secondEndDegree]);

  return (
    <Svg width="180" height="180" viewBox="0 0 180 180">
      <Circle
        cx={centerLocation}
        cy={centerLocation}
        r={radius}
        stroke="#f4f5f7"
        strokeWidth="14"
        fill="transparent"
      />
      <Defs>
        <LinearGradient id="grad1" x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0%" stopColor="#71C4FF" />
          <Stop offset="100%" stopColor="#D378FE" />
        </LinearGradient>
        <LinearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#F0C9FF" />
          <Stop offset="1" stopColor="#D4EEFF" />
        </LinearGradient>
      </Defs>
      <AnimatedPath
        d={describeArc(
          centerLocation,
          centerLocation,
          radius,
          firstEndDegreeAnimated,
          secondEndDegreeAnimated
        )}
        stroke="url(#grad2)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/*
         For a design element, the first arc is on a higher layer
       */}
      {firstEndDegree !== firstStartDegree ? (
        <AnimatedPath
          d={describeArc(
            centerLocation,
            centerLocation,
            radius,
            firstStartDegree,
            firstEndDegreeAnimated
          )}
          stroke="url(#grad1)"
          strokeWidth={14}
          strokeLinecap="round"
        />
      ) : null}
    </Svg>
  );
};
