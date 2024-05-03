import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const FaceDetectIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 28 }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 26 26"
      fill="none"
    >
      <Path
        d="M12.9995 7.71924V12.5192C12.9995 13.5791 12.1393 14.4392 11.0795 14.4392"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M6.76099 7.71924V10.1192"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M19.2406 7.71875V10.1188"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M17.3201 18.7593C16.1162 19.6636 14.6205 20.1993 13.0001 20.1993C11.3796 20.1993 9.88197 19.6636 8.68005 18.7593"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M1.00037 8.67903V4.83902C1.00037 2.71742 2.71877 0.999023 4.84037 0.999023H8.68037"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M17.3197 0.999023H21.1597C23.2813 0.999023 24.9997 2.71742 24.9997 4.83902V8.67903"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M24.9997 17.3198V21.1598C24.9997 23.2814 23.2813 24.9998 21.1597 24.9998H17.3197"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M8.68049 24.9998H4.84049C2.71889 24.9998 1.00049 23.2814 1.00049 21.1598V17.3198"
        stroke="white"
        stroke-width="0.999981"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
