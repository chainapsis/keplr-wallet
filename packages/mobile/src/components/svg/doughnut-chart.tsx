import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import {
  Circle,
  Svg,
  Path,
  LinearGradient,
  Stop,
  Defs,
} from "react-native-svg";
import { Animated, Easing } from "react-native";
import { observer } from "mobx-react-lite";

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");

  return d;
};

type DoughnutChartProps = {
  data: number[];
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const DoughnutChart: FunctionComponent<DoughnutChartProps> = observer(
  ({ data }) => {
    const firstRate = data[0] ? data[0] / (data[0] + data[1]) : 0;
    const secondRate = data[1] ? 1 - firstRate : 0;
    const centerLocation = 50;
    const radius = 46;

    const firstStartDegree = 180;
    const firstEndDegree = Math.floor(360 * firstRate) + firstStartDegree;

    const firstProcess = useRef(new Animated.Value(0)).current;
    const secondProcess = useRef(new Animated.Value(0)).current;

    const firstD = useMemo(() => {
      const firstDRange = [];
      const firstIRange = [];
      const firstSteps = 360 * firstRate;
      for (let i = 0; i < firstSteps; i++) {
        firstDRange.push(
          describeArc(
            centerLocation,
            centerLocation,
            radius,
            firstStartDegree,
            firstStartDegree + i
          )
        );
        firstIRange.push(i / (firstSteps - 1));
      }

      return firstRate
        ? firstProcess.interpolate({
            inputRange: firstIRange,
            outputRange: firstDRange,
          })
        : null;
    }, [firstProcess, firstRate]);

    const secondD = useMemo(() => {
      const secondDRange = [];
      const secondIRange = [];
      const secondSteps = 360 * secondRate;
      for (let i = 0; i < secondSteps; i++) {
        secondDRange.push(
          describeArc(
            centerLocation,
            centerLocation,
            radius,
            firstEndDegree,
            firstEndDegree + i
          )
        );
        secondIRange.push(i / (secondSteps - 1));
      }
      return secondRate
        ? secondProcess.interpolate({
            inputRange: secondIRange,
            outputRange: secondDRange,
          })
        : null;
    }, [firstEndDegree, secondProcess, secondRate]);

    useEffect(() => {
      firstProcess.setValue(0);
      secondProcess.setValue(0);

      Animated.parallel([
        Animated.timing(firstProcess, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(secondProcess, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
      <Svg width="200" height="200" viewBox="0 0 100 100">
        <Circle
          cx={centerLocation.toString()}
          cy={centerLocation.toString()}
          r={radius.toString()}
          stroke="#f4f5f7"
          strokeWidth="7"
          fill="transparent"
        />
        <Defs>
          <LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#6FC5FF" />
            <Stop offset="0.25" stopColor="#6C8AF3" />
            <Stop offset="0.5" stopColor="#834DF5" />
            <Stop offset="0.75" stopColor="#9A7CF1" />
            <Stop offset="1" stopColor="#E482FE" />
          </LinearGradient>
          <LinearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#F0C9FF" />
            <Stop offset="1" stopColor="#D4EEFF" />
          </LinearGradient>
        </Defs>
        {firstD ? (
          <AnimatedPath
            d={firstD}
            stroke="url(#grad1)"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ) : null}
        {secondD ? (
          <AnimatedPath
            d={secondD}
            stroke="url(#grad2)"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
    );
  }
);

// import React, { FunctionComponent } from "react";
// import {
//   Circle,
//   Svg,
//   Path,
//   LinearGradient,
//   Stop,
//   Defs,
// } from "react-native-svg";

// const polarToCartesian = (
//   centerX: number,
//   centerY: number,
//   radius: number,
//   angleInDegrees: number
// ) => {
//   const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

//   return {
//     x: centerX + radius * Math.cos(angleInRadians),
//     y: centerY + radius * Math.sin(angleInRadians),
//   };
// };

// const describeArc = (
//   x: number,
//   y: number,
//   radius: number,
//   startAngle: number,
//   endAngle: number
// ) => {
//   const start = polarToCartesian(x, y, radius, endAngle);
//   const end = polarToCartesian(x, y, radius, startAngle);

//   const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

//   const d = [
//     "M",
//     start.x,
//     start.y,
//     "A",
//     radius,
//     radius,
//     0,
//     largeArcFlag,
//     0,
//     end.x,
//     end.y,
//   ].join(" ");

//   return d;
// };

// type DoughnutChartProps = {
//   data: number[];
// };

// export const DoughnutChart: FunctionComponent<DoughnutChartProps> = ({
//   data,
// }) => {
//   const firstRate = data[0] ? data[0] / (data[0] + data[1]) : 0;
//   const secondRate = data[1] ? 1 - firstRate : 0;
//   const centerLocation = 50;
//   const radius = 46;

//   const firstStartDegree = 180;
//   const firstEndDegree = Math.floor(360 * firstRate) + firstStartDegree;
//   const secondEndDegree = 540;

//   const firstD = describeArc(
//     centerLocation,
//     centerLocation,
//     radius,
//     firstStartDegree,
//     firstEndDegree
//   );
//   const secondD = describeArc(
//     centerLocation,
//     centerLocation,
//     radius,
//     firstEndDegree,
//     secondEndDegree
//   );

//   return (
//     <Svg width="200" height="200" viewBox="0 0 100 100">
//       <Defs>
//         <LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
//           <Stop offset="0" stopColor="#6FC5FF" />
//           <Stop offset="0.25" stopColor="#6C8AF3" />
//           <Stop offset="0.5" stopColor="#834DF5" />
//           <Stop offset="0.75" stopColor="#9A7CF1" />
//           <Stop offset="1" stopColor="#E482FE" />
//         </LinearGradient>
//         <LinearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
//           <Stop offset="0" stopColor="#F0C9FF" />
//           <Stop offset="1" stopColor="#D4EEFF" />
//         </LinearGradient>
//       </Defs>
//       <Circle
//         cx={centerLocation.toString()}
//         cy={centerLocation.toString()}
//         r={radius.toString()}
//         stroke="#f4f5f7"
//         strokeWidth="7"
//         fill="transparent"
//       />
//       {firstRate && secondRate ? (
//         <React.Fragment>
//           <Path d={firstD} stroke="url(#grad1)" strokeWidth={7} />
//           <Path
//             d={secondD}
//             stroke="url(#grad2)"
//             strokeWidth={7}
//             strokeLinecap="round"
//           />
//         </React.Fragment>
//       ) : null}
//       {firstRate && !secondRate ? (
//         <Circle
//           cx={centerLocation.toString()}
//           cy={centerLocation.toString()}
//           r={radius.toString()}
//           stroke="url(#grad1)"
//           strokeWidth="7"
//           fill="transparent"
//         />
//       ) : null}
//       {!firstRate && secondRate ? (
//         <Circle
//           cx={centerLocation.toString()}
//           cy={centerLocation.toString()}
//           r={radius.toString()}
//           stroke="url(#grad2)"
//           strokeWidth="7"
//           fill="transparent"
//         />
//       ) : null}
//     </Svg>
//   );
// };
