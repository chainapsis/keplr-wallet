import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const NewBridgeIcon: FunctionComponent<{
  size?: number;
  color?: any;
}> = ({ size = 17, color = "black" }) => {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      viewBox="0 0 17 16"
      style={{
        width: size,
        height: size,
      }}
      fill="none"
    >
      <Path
        d="M8.5 1.70005C5.84903 1.70005 3.7 3.84908 3.7 6.50005V12H2.3V6.50005C2.3 3.07588 5.07583 0.300049 8.5 0.300049C11.9242 0.300049 14.7 3.07588 14.7 6.50005V9.00005H16L14 12L12 9.00005H13.3V6.50005C13.3 3.84908 11.151 1.70005 8.5 1.70005ZM6 15.5H0V14.1H6V15.5ZM17 15.5H11V14.1H17V15.5Z"
        fill={color}
      />
    </Svg>
  );
};
