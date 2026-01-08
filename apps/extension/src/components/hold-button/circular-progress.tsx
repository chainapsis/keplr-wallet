import React, { CSSProperties, FunctionComponent } from "react";

export interface CircularProgressProps {
  progress: number; // 0 ~ 1
  size?: string;
  color?: string;
  style?: CSSProperties;
}

export const CircularProgress: FunctionComponent<CircularProgressProps> = ({
  progress,
  size = "1.25rem",
  color = "white",
  style,
}) => {
  const radius = 8.5;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={{
        transform: "rotate(-90deg) scaleY(-1)", // start from 12 o'clock, counter-clockwise
        ...style,
      }}
    >
      {/* Background donut - 30% opacity */}
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      {/* Progress circle */}
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transition: progress === 0 ? "none" : "stroke-dashoffset 16ms linear",
        }}
      />
    </svg>
  );
};
