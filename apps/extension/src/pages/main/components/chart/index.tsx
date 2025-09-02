import React, { FunctionComponent, useLayoutEffect, useRef } from "react";
import { YAxis } from "../../../../components/axis";
import { ColorPalette } from "../../../../styles";
import { animated, to, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../../../styles/spring";
import { useTheme } from "styled-components";

export const DualChart: FunctionComponent<{
  first: {
    weight: number;
  };
  second: {
    weight: number;
  };
  highlight: "first" | "second";

  isNotReady?: boolean;
}> = ({ first, second, highlight, isNotReady }) => {
  const width = 208;
  const height = 134;

  const x = 104;
  const y = 105;
  const angle = 208;
  const radius = 99;
  const stroke = 10;

  const startAngle = 180 - angle / 2 + 90;
  const endAngle = 180 - angle / 2 + 90 + angle;

  const firstArcVisibility = (() => {
    if (first.weight <= 0 && second.weight <= 0) {
      return false;
    }

    return highlight === "first";
  })();
  const secondArcVisibility = (() => {
    if (first.weight <= 0 && second.weight <= 0) {
      return false;
    }

    return highlight === "second";
  })();

  const firstArcEndAngle = (() => {
    const fullWeight = first.weight + second.weight;
    if (fullWeight > 0) {
      return startAngle + (first.weight / fullWeight) * angle;
    } else {
      return startAngle;
    }
  })();

  const arcStartAngle = useSpringValue(
    (() => {
      if (!firstArcVisibility && !secondArcVisibility) {
        if (highlight === "first") {
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
    {
      config: defaultSpringConfig,
    }
  );
  const arcEndAngle = useSpringValue(
    (() => {
      if (!firstArcVisibility && !secondArcVisibility) {
        if (highlight === "first") {
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
    {
      config: defaultSpringConfig,
    }
  );

  const theme = useTheme();

  const prevFirstArcVisibility = useRef(firstArcVisibility);
  const prevSecondArcVisibility = useRef(secondArcVisibility);
  useLayoutEffect(() => {
    if (!firstArcVisibility && !secondArcVisibility) {
      if (highlight === "first") {
        arcStartAngle.start(startAngle);
        arcEndAngle.start(startAngle);
      } else {
        arcStartAngle.start(endAngle);
        arcEndAngle.start(endAngle);
      }
    } else {
      if (!prevFirstArcVisibility.current && !prevSecondArcVisibility.current) {
        if (firstArcVisibility) {
          arcStartAngle.set(startAngle);
          arcEndAngle.set(firstArcEndAngle);
        } else {
          arcStartAngle.set(firstArcEndAngle);
          arcEndAngle.set(endAngle);
        }
      } else {
        if (firstArcVisibility) {
          arcStartAngle.start(startAngle);
          arcEndAngle.start(firstArcEndAngle);
        } else {
          arcStartAngle.start(firstArcEndAngle);
          arcEndAngle.start(endAngle);
        }
      }
    }

    prevFirstArcVisibility.current = firstArcVisibility;
    prevSecondArcVisibility.current = secondArcVisibility;
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

  return (
    <YAxis alignX="center">
      <svg
        width="100%"
        height="8.375rem"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C2FF" />
            <stop offset="100%" stopColor="#DB00FF" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <path
          d={getArcPath({
            x,
            y,
            radius,
            startAngle,
            endAngle,
          })}
          stroke={
            theme.mode === "light"
              ? isNotReady
                ? ColorPalette["skeleton-layer-0"]
                : ColorPalette["gray-100"]
              : isNotReady
              ? ColorPalette["gray-600"]
              : ColorPalette["gray-500"]
          }
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        <mask id="arc-mask">
          <animated.path
            d={to([arcStartAngle, arcEndAngle], (startAngle, endAngle) => {
              if (Math.abs(startAngle - endAngle) <= 0.05) {
                return "";
              }

              return getArcPath({
                x,
                y,
                radius,
                startAngle,
                endAngle,
              });
            })}
            stroke="white"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </mask>
        <rect
          id="arc-fill"
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#linear)"
          mask="url(#arc-mask)"
        />
      </svg>
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
  const { x, y, startAngle, endAngle, radius } = opts;

  const startX = x - Math.cos(((180 - startAngle) * Math.PI) / 180) * radius;
  const startY = y + Math.sin(((180 - startAngle) * Math.PI) / 180) * radius;
  const endX = x - Math.cos(((180 - endAngle) * Math.PI) / 180) * radius;
  const endY = y + Math.sin(((180 - endAngle) * Math.PI) / 180) * radius;

  return `M ${startX} ${startY}
           A ${radius} ${radius} 0 ${
    Math.abs(startAngle - endAngle) <= 180 ? 0 : 1
  } 1 ${endX} ${endY}`;
};
