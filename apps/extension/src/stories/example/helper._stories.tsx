import React, { FunctionComponent } from "react";

export const PlaceHolder: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return <div style={{ width, height, backgroundColor: "#AAAAAA" }} />;
};
