import React, { FunctionComponent } from "react";
import { YAxis } from "../../../../components/axis";
import { ColorPalette } from "../../../../styles";

export const DualChart: FunctionComponent<{
  first: {
    weight: number;
  };
  second: {
    weight: number;
  };
  highlight: "first" | "second";
}> = ({ first, second, highlight }) => {
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
    if (first.weight < 0 && second.weight < 0) {
      return false;
    }

    if (highlight !== "first") {
      return false;
    }

    return first.weight > 0;
  })();
  const secondArcVisibility = (() => {
    if (first.weight < 0 && second.weight < 0) {
      return false;
    }

    if (highlight !== "second") {
      return false;
    }

    return second.weight > 0;
  })();

  const firstArcEndAngle = (() => {
    const fullWeight = first.weight + second.weight;
    if (fullWeight > 0) {
      return startAngle + (first.weight / fullWeight) * angle;
    } else {
      return startAngle;
    }
  })();
  const secondArcEndAngle = (() => {
    const fullWeight = first.weight + second.weight;
    if (fullWeight > 0) {
      return firstArcEndAngle + (second.weight / fullWeight) * angle;
    } else {
      return firstArcEndAngle;
    }
  })();

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
            <stop offset="0%" stopColor="#05a" />
            <stop offset="100%" stopColor="#0a5" />
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
          stroke={ColorPalette["gray-500"]}
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {firstArcVisibility ? (
          <React.Fragment>
            <mask id="arc1-mask">
              <path
                d={getArcPath({
                  x,
                  y,
                  radius,
                  startAngle,
                  endAngle: firstArcEndAngle,
                })}
                stroke="white"
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            </mask>
            <rect
              id="arc1-fill"
              x={0}
              y={0}
              width={width}
              height={height}
              fill="url(#linear)"
              mask="url(#arc1-mask)"
            />
          </React.Fragment>
        ) : null}
        {secondArcVisibility ? (
          <React.Fragment>
            <mask id="arc2-mask">
              <path
                d={getArcPath({
                  x,
                  y,
                  radius,
                  startAngle: firstArcEndAngle,
                  endAngle: secondArcEndAngle,
                })}
                stroke="white"
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            </mask>
            <rect
              id="arc2-fill"
              x={0}
              y={0}
              width={width}
              height={height}
              fill="url(#linear)"
              mask="url(#arc2-mask)"
            />
          </React.Fragment>
        ) : null}
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
