import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useStyle } from "../../styles";

// Convert to cartesian coordinates from polar coordinates.
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegree: Animated.Adaptable<number>
): {
  x: Animated.Adaptable<number>;
  y: Animated.Adaptable<number>;
} => {
  const angleInRadian = Animated.divide(
    Animated.multiply(angleInDegree, Math.PI),
    180
  );

  return {
    x: Animated.add(
      centerX,
      Animated.multiply(radius, Animated.cos(angleInRadian))
    ),
    y: Animated.add(
      centerY,
      Animated.multiply(radius, Animated.sin(angleInRadian))
    ),
  };
};

// Draw arc in clockwise.
// End angle should be greater than or equal to start angle.
// Else, behavior is not guaranteed.
const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngleInDegree: Animated.Adaptable<number>,
  endAngleInDegree: Animated.Adaptable<number>
) => {
  const start = polarToCartesian(x, y, radius, startAngleInDegree);
  const end = polarToCartesian(
    x,
    y,
    radius,
    // Can't draw an arc from the same point to the same point in svg.
    // Due to this problem, it only allows up to 359.9 degree.
    Animated.min(endAngleInDegree, Animated.add(startAngleInDegree, 359.9))
  );

  const largeArcFlag = Animated.cond(
    Animated.lessThan(Animated.sub(endAngleInDegree, startAngleInDegree), 180),
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

const gapAngleInDegree = 14;
const minArcAngleInDegree = 0.2;

// NOTE: `velocitySec` and `minDurationMs` are only used when the animation starts.
//       It doesn't react whenever these values change.
//       Therefore, use constant `velocitySec` and `minDurationMs` as much as possible.
const useAnimated = (
  toValue: Animated.Adaptable<number>,
  velocitySec: number,
  minDurationMs: number = 0
) => {
  const [prevToValue] = useState(() => new Animated.Value<number>());

  const [clock] = useState(() => new Animated.Clock());
  const [state] = useState(() => {
    return {
      finished: new Animated.Value<number>(0),
      position: new Animated.Value<number>(),
      time: new Animated.Value<number>(0),
      frameTime: new Animated.Value<number>(0),
    };
  });

  const config = useMemo(() => {
    return {
      duration: new Animated.Value(0),
      toValue,
      easing: Easing.out(Easing.cubic),
    };
  }, [toValue]);

  return useMemo(
    () =>
      Animated.block([
        Animated.cond(Animated.not(Animated.defined(state.position)), [
          Animated.set(state.position, toValue),
          Animated.set(prevToValue, toValue),
        ]),

        Animated.cond(Animated.not(Animated.eq(prevToValue, toValue)), [
          Animated.set(state.time, 0),
          Animated.set(state.frameTime, 0),
          Animated.cond(Animated.not(Animated.clockRunning(clock)), [
            Animated.set(state.finished, 0),
            Animated.startClock(clock),
          ]),
          Animated.set(
            config.duration,
            Animated.multiply(
              Animated.divide(
                Animated.abs(Animated.sub(toValue, prevToValue)),
                velocitySec
              ),
              1000
            )
          ),
          Animated.set(
            config.duration,
            Animated.max(config.duration, minDurationMs)
          ),

          Animated.set(prevToValue, toValue),
        ]),

        Animated.timing(clock, state, config),
        Animated.cond(state.finished, Animated.stopClock(clock)),
        state.position,
      ]),
    [clock, config, minDurationMs, prevToValue, state, toValue, velocitySec]
  );
};

export const DoubleDoughnutChart: FunctionComponent<{
  size?: number;
  // Only two data are allowed. If it is [0, 0], a gray ring is shown behind. If undefined, nothing is displayed.
  data: [number, number] | undefined;
}> = ({ data, size = 188 }) => {
  const [targetFirstRatio] = useState(() => new Animated.Value<number>(0));
  const [targetSecondRatio] = useState(() => new Animated.Value<number>(0));

  const [valueDataIsLoaded] = useState(() => new Animated.Value(data ? 1 : 0));
  const [backRingOpacity] = useState(() => new Animated.Value(0));

  const [targetFirstArcStartAngleInDegree] = useState(
    () => new Animated.Value(90)
  );
  const [targetFirstArcEndAngleInDegree] = useState(
    () => new Animated.Value(90)
  );
  const [targetSecondArcStartAngleInDegree] = useState(
    () => new Animated.Value(90)
  );
  const [targetSecondArcEndAngleInDegree] = useState(
    () => new Animated.Value(90)
  );

  const dataIsLoaded = !!data;
  const firstData = data ? data[0] : 0;
  const secondData = data ? data[1] : 0;
  const sumData = firstData + secondData;

  // If animated node is updated too often, some strange glitches occur.
  // To alleviate this problem, debounce to update animated node.
  const debouncer = useRef<NodeJS.Timeout | undefined>();
  useEffect(() => {
    let firstRatio: number;
    let secondRatio: number;

    if (sumData > 0) {
      firstRatio = firstData / sumData;
      secondRatio = secondData / sumData;
    } else {
      firstRatio = 0;
      secondRatio = 0;
    }

    if (sumData > 0) {
      if (debouncer.current != null) {
        clearTimeout(debouncer.current);

        debouncer.current = setTimeout(() => {
          targetFirstRatio.setValue(firstRatio);
          targetSecondRatio.setValue(secondRatio);
          valueDataIsLoaded.setValue(dataIsLoaded ? 1 : 0);

          debouncer.current = undefined;
        }, 250);
      } else {
        debouncer.current = setTimeout(() => {
          targetFirstRatio.setValue(firstRatio);
          targetSecondRatio.setValue(secondRatio);
          valueDataIsLoaded.setValue(dataIsLoaded ? 1 : 0);

          debouncer.current = undefined;
        }, 100);
      }
    } else {
      if (debouncer.current != null) {
        clearTimeout(debouncer.current);
      }

      debouncer.current = setTimeout(() => {
        targetFirstRatio.setValue(firstRatio);
        targetSecondRatio.setValue(secondRatio);
        valueDataIsLoaded.setValue(dataIsLoaded ? 1 : 0);

        debouncer.current = undefined;
      }, 500);
    }
  }, [
    firstData,
    secondData,
    sumData,
    targetFirstRatio,
    targetSecondRatio,
    dataIsLoaded,
    valueDataIsLoaded,
  ]);

  Animated.useCode(() => {
    return Animated.block([
      Animated.cond(
        Animated.greaterThan(targetSecondRatio, 0),
        [
          Animated.cond(
            Animated.greaterThan(targetFirstRatio, 0),
            [
              Animated.set(
                targetFirstArcStartAngleInDegree,
                90 + gapAngleInDegree / 2
              ),
              Animated.set(
                targetFirstArcEndAngleInDegree,
                Animated.add(
                  Animated.max(
                    Animated.min(
                      Animated.sub(
                        Animated.multiply(360, targetFirstRatio),
                        gapAngleInDegree
                      ),
                      360 - gapAngleInDegree * 2 - minArcAngleInDegree
                    ),
                    minArcAngleInDegree
                  ),
                  90 + gapAngleInDegree / 2
                )
              ),
            ],
            [
              Animated.set(targetFirstArcStartAngleInDegree, 90),
              Animated.set(targetFirstArcEndAngleInDegree, 90),
            ]
          ),
        ],
        [
          Animated.set(targetFirstArcStartAngleInDegree, 90),
          Animated.set(
            targetFirstArcEndAngleInDegree,
            Animated.add(Animated.multiply(360, targetFirstRatio), 90)
          ),
        ]
      ),
      Animated.cond(
        Animated.greaterThan(targetFirstRatio, 0),
        [
          Animated.cond(
            Animated.greaterThan(targetSecondRatio, 0),
            [
              Animated.set(
                targetSecondArcStartAngleInDegree,
                Animated.add(targetFirstArcEndAngleInDegree, gapAngleInDegree)
              ),
              Animated.set(
                targetSecondArcEndAngleInDegree,
                360 + 90 - gapAngleInDegree / 2
              ),
            ],
            [
              Animated.set(targetSecondArcStartAngleInDegree, 360 + 90),
              Animated.set(targetSecondArcEndAngleInDegree, 360 + 90),
            ]
          ),
        ],
        [
          Animated.cond(
            Animated.greaterThan(targetSecondRatio, 0),
            [
              Animated.set(
                targetSecondArcStartAngleInDegree,
                Animated.add(
                  Animated.sub(360, Animated.multiply(360, targetSecondRatio)),
                  90
                )
              ),
              Animated.set(targetSecondArcEndAngleInDegree, 360 + 90),
            ],
            [
              Animated.set(targetSecondArcStartAngleInDegree, 90),
              Animated.set(targetSecondArcEndAngleInDegree, 90),
            ]
          ),
        ]
      ),
      Animated.cond(
        Animated.and(
          Animated.greaterThan(valueDataIsLoaded, 0),
          Animated.lessOrEq(targetFirstRatio, 0),
          Animated.lessOrEq(targetSecondRatio, 0)
        ),
        [Animated.set(backRingOpacity, 1)],
        [Animated.set(backRingOpacity, 0)]
      ),
    ]);
  }, [
    targetFirstRatio,
    targetSecondRatio,
    targetFirstArcStartAngleInDegree,
    targetFirstArcEndAngleInDegree,
    targetSecondArcEndAngleInDegree,
    targetSecondArcStartAngleInDegree,
    valueDataIsLoaded,
    backRingOpacity,
  ]);

  const animBackRingOpacity = useAnimated(backRingOpacity, 2);

  const animFirstArcStartAngleInDegree = useAnimated(
    targetFirstArcStartAngleInDegree,
    330,
    600
  );
  const animFirstArcEndAngleInDegree = useAnimated(
    targetFirstArcEndAngleInDegree,
    330,
    600
  );
  const animSecondArcStartAngleInDegree = useAnimated(
    targetSecondArcStartAngleInDegree,
    330,
    600
  );
  const animSecondArcEndAngleInDegree = useAnimated(
    targetSecondArcEndAngleInDegree,
    330,
    600
  );

  return (
    <DoubleDoughnutChartInnerSVG
      size={size}
      backRingOpacity={animBackRingOpacity}
      firstArcStartAngleInDegree={animFirstArcStartAngleInDegree}
      firstArcEndAngleInDegree={animFirstArcEndAngleInDegree}
      secondArcStartAngleInDegree={animSecondArcStartAngleInDegree}
      secondArcEndAngleInDegree={animSecondArcEndAngleInDegree}
    />
  );
};

const DoubleDoughnutChartInnerSVG: FunctionComponent<{
  size: number;

  backRingOpacity?: Animated.Adaptable<number>;

  firstArcStartAngleInDegree: Animated.Adaptable<number>;
  firstArcEndAngleInDegree: Animated.Adaptable<number>;
  secondArcStartAngleInDegree: Animated.Adaptable<number>;
  secondArcEndAngleInDegree: Animated.Adaptable<number>;
  // eslint-disable-next-line react/display-name
}> = React.memo(
  ({
    size,

    backRingOpacity,

    firstArcStartAngleInDegree,
    firstArcEndAngleInDegree,
    secondArcStartAngleInDegree,
    secondArcEndAngleInDegree,
  }) => {
    const style = useStyle();

    const centerLocation = 90;
    const radius = 83;
    const capRadius = centerLocation - radius;

    const firstStartCapPosition = useMemo(() => {
      return polarToCartesian(
        centerLocation,
        centerLocation,
        radius,
        firstArcStartAngleInDegree
      );
    }, [centerLocation, firstArcStartAngleInDegree, radius]);
    const firstEndCapPosition = useMemo(() => {
      return polarToCartesian(
        centerLocation,
        centerLocation,
        radius,
        firstArcEndAngleInDegree
      );
    }, [centerLocation, firstArcEndAngleInDegree, radius]);

    const secondStartCapPosition = useMemo(() => {
      return polarToCartesian(
        centerLocation,
        centerLocation,
        radius,
        secondArcStartAngleInDegree
      );
    }, [centerLocation, radius, secondArcStartAngleInDegree]);
    const secondEndCapPosition = useMemo(() => {
      return polarToCartesian(
        centerLocation,
        centerLocation,
        radius,
        secondArcEndAngleInDegree
      );
    }, [centerLocation, radius, secondArcEndAngleInDegree]);

    const hideFirstArcCaps = useMemo(() => {
      return Animated.cond(
        Animated.lessThan(
          Animated.abs(
            Animated.sub(firstArcEndAngleInDegree, firstArcStartAngleInDegree)
          ),
          0.1
        ),
        1,
        0
      );
    }, [firstArcEndAngleInDegree, firstArcStartAngleInDegree]);

    const hideSecondArcCaps = useMemo(() => {
      return Animated.cond(
        Animated.lessThan(
          Animated.abs(
            Animated.sub(secondArcEndAngleInDegree, secondArcStartAngleInDegree)
          ),
          0.1
        ),
        1,
        0
      );
    }, [secondArcEndAngleInDegree, secondArcStartAngleInDegree]);

    return (
      <Svg width={size} height={size} viewBox="0 0 180 180">
        <AnimatedCircle
          cx={centerLocation}
          cy={centerLocation}
          r={radius}
          stroke={
            style.flatten(["color-gray-50", "dark:color-platinum-500"]).color
          }
          strokeWidth="14"
          fill="transparent"
          opacity={backRingOpacity ? backRingOpacity : 0}
        />
        <Defs>
          <LinearGradient id="grad1" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0%" stopColor="#71C4FF" />
            <Stop offset="100%" stopColor="#D378FE" />
          </LinearGradient>
          <LinearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
            <Stop
              offset="0%"
              stopColor={style.theme === "dark" ? "#394365" : "#F0C9FF"}
            />
            <Stop
              offset="100%"
              stopColor={style.theme === "dark" ? "#2F4C65" : "#D4EEFF"}
            />
          </LinearGradient>
          <ClipPath id="first-arc-clip">
            <AnimatedPath
              d={describeArc(
                centerLocation,
                centerLocation,
                centerLocation,
                firstArcStartAngleInDegree,
                firstArcEndAngleInDegree
              )}
              fill="white"
            />
            <AnimatedCircle
              cx={firstStartCapPosition.x}
              cy={firstStartCapPosition.y}
              r={Animated.cond(
                Animated.greaterThan(hideFirstArcCaps, 0),
                0,
                capRadius
              )}
              fill="white"
            />
            <AnimatedCircle
              cx={firstEndCapPosition.x}
              cy={firstEndCapPosition.y}
              r={Animated.cond(
                Animated.greaterThan(hideFirstArcCaps, 0),
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
                secondArcStartAngleInDegree,
                secondArcEndAngleInDegree
              )}
              fill="white"
            />
            <AnimatedCircle
              cx={secondStartCapPosition.x}
              cy={secondStartCapPosition.y}
              r={
                hideSecondArcCaps
                  ? Animated.cond(
                      Animated.greaterThan(hideSecondArcCaps, 0),
                      0,
                      capRadius
                    )
                  : capRadius
              }
              fill="white"
            />
            <AnimatedCircle
              cx={secondEndCapPosition.x}
              cy={secondEndCapPosition.y}
              r={
                hideSecondArcCaps
                  ? Animated.cond(
                      Animated.greaterThan(hideSecondArcCaps, 0),
                      0,
                      capRadius
                    )
                  : capRadius
              }
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
  }
);
