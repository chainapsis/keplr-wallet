import React, { FunctionComponent } from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { ColorPalette } from "../../styles";

export const DoubleDoughnutChart: FunctionComponent<{
  size?: number;
  // Only two data are allowed. If it is [0, 0], a gray ring is shown behind. If undefined, nothing is displayed.
  data: [number, number];
}> = ({ data, size = 188 }) => {
  const minThreshold = 1e-5; // Minimum threshold for rendering an arc
  const strokeWidth = 14;

  const centerLocation = size / 2;
  const radius = centerLocation - strokeWidth / 2;

  // Calculate the sum of data values
  const sum = data.reduce((acc, value) => acc + value, 0);

  // Filter out data values below the minimum threshold
  const filteredData = data.filter((value) => value >= minThreshold);

  // Calculate the angles for the arcs
  const angles = filteredData.map((value) => (value / sum) * 360);

  // If there's no data to display, show a single gray circle
  if (filteredData.length === 0) {
    return (
      // Display a single empty circle (no arc) when all data values are 0
      <View>
        <Svg width={size} height={size}>
          <Circle
            cx={centerLocation}
            cy={centerLocation}
            r={radius}
            stroke={ColorPalette["gray-100"]} // Color of the background circle
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  // Calculate the paths for the arcs
  const paths = [];
  let startAngle = -90;
  for (let i = 0; i < angles.length; i++) {
    const angle = angles[i];
    const endAngle = startAngle + angle;
    const startX =
      centerLocation + radius * Math.cos(startAngle * (Math.PI / 180));
    const startY =
      centerLocation + radius * Math.sin(startAngle * (Math.PI / 180));
    const endX = centerLocation + radius * Math.cos(endAngle * (Math.PI / 180));
    const endY = centerLocation + radius * Math.sin(endAngle * (Math.PI / 180));

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = `
      M ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
    `;

    paths.push(pathData);

    startAngle = endAngle;
  }

  return (
    <View>
      <Svg width={size} height={size}>
        {paths.map((pathData, index) => (
          <Path
            key={index}
            d={pathData}
            stroke={
              index === 0 ? ColorPalette["blue-400"] : ColorPalette["staking"]
            } // Alternate colors for each doughnut
            strokeWidth={strokeWidth}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
};
