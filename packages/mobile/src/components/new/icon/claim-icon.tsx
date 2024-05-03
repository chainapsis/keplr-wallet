import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ClaimIcon: FunctionComponent<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
      }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M9.25 6.25L12 9.15625L14.7188 6.25H9.25ZM15.9688 7.125L13.7188 9.5H17.75L15.9688 7.125ZM17.5312 11H12H6.4375L12 17.1562L17.5312 11ZM6.21875 9.5H10.25L8 7.125L6.21875 9.5ZM19.7812 10.7812L12.5312 18.7812C12.4062 18.9375 12.1875 19 12 19C11.7812 19 11.5625 18.9375 11.4375 18.7812L4.1875 10.7812C3.9375 10.5 3.90625 10.0938 4.125 9.8125L7.625 5.0625C7.78125 4.875 8 4.75 8.25 4.75H15.75C15.9688 4.75 16.1875 4.875 16.3438 5.0625L19.8438 9.8125C20.0625 10.0938 20.0312 10.5 19.7812 10.7812Z"
        fill={color}
      />
    </Svg>
  );
};
