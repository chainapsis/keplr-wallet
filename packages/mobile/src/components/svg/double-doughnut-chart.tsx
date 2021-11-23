import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import {
  Circle,
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Svg,
  Use,
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
    Animated.multiply(Animated.add(angleInDegrees, 90), Math.PI),
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
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);

  const largeArcFlag = Animated.cond(
    Animated.lessThan(Animated.sub(endAngle, startAngle), 180),
    0,
    1
  );

  const d = [
    "M",
    " ",
    x,
    " ",
    y,
    " ",
    "L",
    " ",
    start.x,
    " ",
    start.y,
    " ",
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
    1,
    " ",
    end.x,
    " ",
    end.y,
    " ",
    "L",
    " ",
    x,
    " ",
    y,
  ];

  return Animated.concat(...d);
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const DoubleDoughnutChart: FunctionComponent<{
  size?: number;
  data: [number, number];
}> = ({ data, size = 188 }) => {
  const centerLocation = 90;
  const radius = 83;

  const firstProcess = useRef(new Animated.Value(0));
  const secondProcess = useRef(new Animated.Value(0));

  const firstData = data[0];
  const secondData = data[1];

  const firstEndDegree = useMemo(() => {
    const sum = firstData + secondData;
    const rate = sum > 0 ? firstData / sum : 0;
    return 359.9 * rate;
  }, [firstData, secondData]);

  const secondEndDegree = useMemo(() => {
    const sum = firstData + secondData;
    const firstRate = sum > 0 ? firstData / sum : 0;
    const rate = secondData > 0 ? 1 - firstRate : 0;
    return 359.9 * rate + firstEndDegree;
  }, [firstData, firstEndDegree, secondData]);

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

  const capRadius = centerLocation - radius;
  const firstStartCapPosition = polarToCartesian(
    centerLocation,
    centerLocation,
    radius,
    0
  );
  const firstEndCapPosition = polarToCartesian(
    centerLocation,
    centerLocation,
    radius,
    firstProcess.current
  );
  const secondEndCapPosition = polarToCartesian(
    centerLocation,
    centerLocation,
    radius,
    secondProcess.current
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
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
          <Stop offset="0%" stopColor="#F0C9FF" />
          <Stop offset="100%" stopColor="#D4EEFF" />
        </LinearGradient>
        <ClipPath id="first-arc-clip">
          <AnimatedPath
            d={describeArc(
              centerLocation,
              centerLocation,
              centerLocation,
              0,
              firstProcess.current
            )}
            fill="white"
          />
          <AnimatedCircle
            cx={firstStartCapPosition.x}
            cy={firstStartCapPosition.y}
            r={Animated.cond(
              Animated.lessOrEq(firstProcess.current, 0.1),
              0,
              capRadius
            )}
            fill="white"
          />
          <AnimatedCircle
            cx={firstEndCapPosition.x}
            cy={firstEndCapPosition.y}
            r={Animated.cond(
              Animated.lessOrEq(firstProcess.current, 0.1),
              0,
              capRadius
            )}
            fill="white"
          />
        </ClipPath>
        <ClipPath id="second-arc-clip">
          <AnimatedPath
            d={describeArc(
              centerLocation,
              centerLocation,
              centerLocation,
              firstProcess.current,
              secondProcess.current
            )}
            fill="white"
          />
          <AnimatedCircle
            cx={firstEndCapPosition.x}
            cy={firstEndCapPosition.y}
            r={Animated.cond(
              Animated.lessOrEq(secondProcess.current, 0.1),
              0,
              capRadius
            )}
            fill="white"
          />
          <AnimatedCircle
            cx={secondEndCapPosition.x}
            cy={secondEndCapPosition.y}
            r={Animated.cond(
              Animated.lessOrEq(secondProcess.current, 0.1),
              0,
              capRadius
            )}
            fill="white"
          />
        </ClipPath>
      </Defs>
      <Circle
        id="second-arc"
        cx={centerLocation}
        cy={centerLocation}
        r={radius}
      />
      <Use
        clipPath="url(#second-arc-clip)"
        xlinkHref="#second-arc"
        fill="transparent"
        stroke="url(#grad2)"
        strokeWidth="14"
        clipRule="nonzero"
      />
      <Circle
        id="first-arc"
        cx={centerLocation}
        cy={centerLocation}
        r={radius}
      />
      <Use
        clipPath="url(#first-arc-clip)"
        xlinkHref="#first-arc"
        fill="transparent"
        stroke="url(#grad1)"
        strokeWidth="14"
        clipRule="nonzero"
      />
    </Svg>
  );
};
