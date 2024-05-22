import React, {FunctionComponent, useLayoutEffect} from 'react';
import {YAxis} from '../../../../components/axis';
import {ColorPalette} from '../../../../styles';
import {defaultSpringConfig} from '../../../../styles/spring';
import Svg, {
  Defs,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ReanimatedPath = Reanimated.createAnimatedComponent(Path);

export const DualChart: FunctionComponent<{
  first: {
    weight: number;
  };
  second: {
    weight: number;
  };
  highlight: 'first' | 'second';

  isNotReady?: boolean;
}> = ({first, second, highlight, isNotReady}) => {
  const width = 262;
  const height = 168;

  const x = 134;
  const y = 130;
  const angle = 208;
  const radius = 120;
  const stroke = 12;

  const startAngle = 180 - angle / 2 + 90;
  const endAngle = 180 - angle / 2 + 90 + angle;

  const firstArcVisibility = (() => {
    if (first.weight <= 0 && second.weight <= 0) {
      return false;
    }

    return highlight === 'first';
  })();
  const secondArcVisibility = (() => {
    if (first.weight <= 0 && second.weight <= 0) {
      return false;
    }

    return highlight === 'second';
  })();

  const firstArcEndAngle = (() => {
    const fullWeight = first.weight + second.weight;
    if (fullWeight > 0) {
      return startAngle + (first.weight / fullWeight) * angle;
    } else {
      return startAngle;
    }
  })();

  const arcStartAngle = useSharedValue(
    (() => {
      if (!firstArcVisibility && !secondArcVisibility) {
        if (highlight === 'first') {
          return startAngle;
        } else {
          return endAngle;
        }
      }

      if (firstArcVisibility) {
        return startAngle;
      } else {
        return firstArcEndAngle;
      }
    })(),
  );

  const arcEndAngle = useSharedValue(
    (() => {
      if (!firstArcVisibility && !secondArcVisibility) {
        if (highlight === 'first') {
          return startAngle;
        } else {
          return endAngle;
        }
      }

      if (firstArcVisibility) {
        return firstArcEndAngle;
      } else {
        return endAngle;
      }
    })(),
  );

  useLayoutEffect(() => {
    if (!firstArcVisibility && !secondArcVisibility) {
      if (highlight === 'first') {
        arcStartAngle.value = withSpring(startAngle, defaultSpringConfig);
        arcEndAngle.value = withSpring(startAngle, defaultSpringConfig);
      } else {
        arcStartAngle.value = withSpring(endAngle, defaultSpringConfig);
        arcEndAngle.value = withSpring(endAngle, defaultSpringConfig);
      }
    } else {
      if (firstArcVisibility) {
        arcStartAngle.value = withSpring(startAngle, defaultSpringConfig);
        arcEndAngle.value = withSpring(firstArcEndAngle, defaultSpringConfig);
      } else {
        arcStartAngle.value = withSpring(firstArcEndAngle, defaultSpringConfig);
        arcEndAngle.value = withSpring(endAngle, defaultSpringConfig);
      }
    }
  }, [
    arcEndAngle,
    arcStartAngle,
    endAngle,
    firstArcEndAngle,
    firstArcVisibility,
    highlight,
    secondArcVisibility,
    startAngle,
  ]);

  const animatedPathProps = useAnimatedProps(() => {
    if (Math.abs(arcStartAngle.value - arcEndAngle.value) <= 0.05) {
      return {
        d: 'M 0 0',
      };
    }

    return {
      d: getArcPath({
        x,
        y,
        radius,
        startAngle: arcStartAngle.value,
        endAngle: arcEndAngle.value,
      }),
    };
  });

  return (
    <YAxis alignX="center">
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none">
        <Defs>
          <LinearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00C2FF" />
            <Stop offset="100%" stopColor="#DB00FF" />
          </LinearGradient>
        </Defs>

        {/* Background ring */}
        <Path
          d={getArcPath({
            x,
            y,
            radius,
            startAngle,
            endAngle,
          })}
          stroke={
            isNotReady ? ColorPalette['gray-600'] : ColorPalette['gray-500']
          }
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        <Mask id="arc-mask">
          <ReanimatedPath
            stroke="white"
            strokeWidth={stroke}
            strokeLinecap="round"
            animatedProps={animatedPathProps}
          />
        </Mask>
        <Rect
          id="arc-fill"
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#linear)"
          mask="url(#arc-mask)"
        />
      </Svg>
    </YAxis>
  );
};

const getArcPath = (opts: {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
}) => {
  'worklet';
  const {x, y, startAngle, endAngle, radius} = opts;

  const startX = x - Math.cos(((180 - startAngle) * Math.PI) / 180) * radius;
  const startY = y + Math.sin(((180 - startAngle) * Math.PI) / 180) * radius;
  const endX = x - Math.cos(((180 - endAngle) * Math.PI) / 180) * radius;
  const endY = y + Math.sin(((180 - endAngle) * Math.PI) / 180) * radius;

  return `M ${startX} ${startY}
           A ${radius} ${radius} 0 ${
    Math.abs(startAngle - endAngle) <= 180 ? 0 : 1
  } 1 ${endX} ${endY}`;
};
