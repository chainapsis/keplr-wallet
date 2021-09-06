import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const VectorS: FunctionComponent<{
  height: number;
  color: string;
}> = ({ height, color }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 16 23"
      style={{
        height,
        aspectRatio: 16 / 23,
      }}
    >
      <Path
        fill={color}
        fillRule="nonzero"
        d="M.305.012a.334.334 0 01-.238-.097l.05-.058a.27.27 0 00.192.082c.045 0 .081-.01.106-.029a.09.09 0 00.037-.075.099.099 0 00-.009-.044.093.093 0 00-.025-.031.193.193 0 00-.037-.023L.334-.284.24-.325a.569.569 0 01-.05-.024.19.19 0 01-.079-.082.14.14 0 01-.013-.063c0-.025.005-.048.016-.069a.171.171 0 01.045-.056.22.22 0 01.068-.036.286.286 0 01.288.068l-.044.054A.255.255 0 00.4-.579a.23.23 0 00-.09-.016.152.152 0 00-.092.025.084.084 0 00-.035.071c0 .016.004.029.011.04a.15.15 0 00.064.051L.3-.39l.092.04a.282.282 0 01.103.063c.012.014.023.03.031.048a.183.183 0 01-.005.137.175.175 0 01-.046.059.206.206 0 01-.073.04.295.295 0 01-.097.015z"
        transform="translate(-978.27 -23.377) translate(976.037 45.644) scale(33.3333)"
      />
    </Svg>
  );
};
