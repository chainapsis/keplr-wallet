import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const AddressBookIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      viewBox="0 0 14 16"
      style={{
        height,
        aspectRatio: 14 / 16,
      }}
    >
      <Path
        fill={color}
        d="M2.426.045c-.981 0-1.79.809-1.79 1.79v11.436a.596.596 0 000 .194v.7c0 .981.809 1.79 1.79 1.79h10.739a.597.597 0 100-1.194H2.426a.588.588 0 01-.596-.596v-.2h11.335a.597.597 0 00.596-.596V1.835c0-.981-.808-1.79-1.79-1.79H2.427zM7.2 3.227c.768 0 1.392.625 1.392 1.392 0 .768-.624 1.392-1.392 1.392A1.394 1.394 0 015.807 4.62c0-.767.624-1.392 1.392-1.392zm-1.79 3.978h3.58c.659 0 1.193.534 1.193 1.193v.795c0 .877-1.558 1.591-2.983 1.591-1.426 0-2.983-.714-2.983-1.59v-.796c0-.66.534-1.193 1.193-1.193z"
      />
    </Svg>
  );
};
