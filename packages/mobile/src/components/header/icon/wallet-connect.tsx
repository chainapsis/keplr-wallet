import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../../styles";

export const HeaderWalletConnectIcon: FunctionComponent<{
  color?: string;
  size?: number;
}> = ({ color, size = 28 }) => {
  const style = useStyle();

  if (!color) {
    color = style.get("color-primary").color;
  }

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 28 28">
      <Path
        fill={color}
        d="M6.421 9.963c4.186-3.95 10.972-3.95 15.158 0l.504.476c.209.197.209.518 0 .715l-1.724 1.627a.28.28 0 01-.379 0l-.693-.655c-2.92-2.756-7.654-2.756-10.574 0l-.743.701a.28.28 0 01-.379 0l-1.723-1.626a.486.486 0 010-.716l.553-.522zm18.722 3.364l1.533 1.448c.21.198.21.518 0 .716l-6.915 6.527a.559.559 0 01-.758 0l-4.908-4.633a.14.14 0 00-.19 0l-4.908 4.633a.559.559 0 01-.758 0L1.324 15.49a.486.486 0 010-.715l1.533-1.448a.559.559 0 01.758 0l4.908 4.633a.14.14 0 00.19 0l4.908-4.633a.559.559 0 01.758 0l4.908 4.633a.14.14 0 00.19 0l4.908-4.633a.559.559 0 01.758 0z"
      />
    </Svg>
  );
};
