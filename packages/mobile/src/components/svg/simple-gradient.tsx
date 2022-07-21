import React, { FunctionComponent } from "react";
import { Rect, Svg, LinearGradient, Stop, Defs } from "react-native-svg";

export const SimpleGradient: FunctionComponent<{
  degree: number;
  stops: {
    offset: string;
    color: string;
  }[];
}> = ({ degree, stops }) => {
  const normD = degree < 0 ? 360 + (degree % 360) : degree % 360;

  let dx =
    Math.floor(((normD + 45) % 360) / 90) % 2 === 0
      ? Math.abs(Math.tan((Math.PI / 180) * normD) * 50)
      : 50;

  if (normD > 180) {
    dx = dx * -1;
  }

  let dy =
    Math.floor(((normD + 45) % 360) / 90) % 2 === 0
      ? 50
      : Math.abs((1 / Math.tan((Math.PI / 180) * normD)) * 50);

  if (normD < 90 || normD > 270) {
    dy = dy * -1;
  }

  return (
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 600 600"
    >
      <Defs>
        <LinearGradient
          id="grad"
          x1={`${50 - dx}%`}
          y1={`${50 - dy}%`}
          x2={`${50 + dx}%`}
          y2={`${50 + dy}%`}
        >
          {stops.map((stop, i) => {
            return <Stop key={i} offset={stop.offset} stopColor={stop.color} />;
          })}
        </LinearGradient>
      </Defs>
      <Rect width="600" height="600" fill="url(#grad)" />
    </Svg>
  );
};
