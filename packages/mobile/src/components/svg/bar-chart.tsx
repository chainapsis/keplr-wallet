import React, { FunctionComponent, useMemo } from "react";
import Svg, { Rect } from "react-native-svg";

type BarChartProps = {
  labels: string[];
  data: number[];
  backgroundColors: string[];
};

export const BarChart: FunctionComponent<BarChartProps> = ({
  labels,
  data,
  backgroundColors,
}) => {
  const totalValue = useMemo(() => {
    return data.reduce(
      (previousValue, currentValue) => previousValue + currentValue
    );
  }, [data]);

  const percentArray = useMemo(() => {
    return data.map((value) => {
      totalValue ? value / totalValue : 0;
    });
  }, [data]);

  console.log(percentArray);

  return (
    <Svg
      height="7px"
      width="100%"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
    >
      <Rect
        rx="1.5"
        ry="1.5"
        x="0"
        y="0"
        width="100"
        height="4"
        fill="#e9ecef"
      />
    </Svg>
  );
};
