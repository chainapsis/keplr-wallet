import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const TrashCanIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 25"
      style={{
        height: size,
        aspectRatio: 24 / 25,
      }}
    >
      <Path
        fill={color}
        d="M20.25 5h-4.5V3.875A1.875 1.875 0 0013.875 2h-3.75A1.875 1.875 0 008.25 3.875V5h-4.5a.75.75 0 000 1.5h.797l.89 14.293C5.505 22.052 6.47 23 7.688 23h8.625c1.225 0 2.17-.927 2.25-2.203L19.453 6.5h.797a.75.75 0 100-1.5zM9.027 20H9a.75.75 0 01-.75-.723l-.375-10.5a.75.75 0 011.5-.054l.375 10.5a.75.75 0 01-.723.777zm3.723-.75a.75.75 0 11-1.5 0V8.75a.75.75 0 111.5 0v10.5zM14.25 5h-4.5V3.875a.37.37 0 01.375-.375h3.75a.371.371 0 01.375.375V5zm1.5 14.277A.75.75 0 0115 20h-.027a.75.75 0 01-.723-.777l.375-10.5a.75.75 0 011.5.054l-.375 10.5z"
      />
    </Svg>
  );
};
