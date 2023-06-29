import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const CalcFiWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Calc Finance"
      source={{ uri: "https://app.calculated.fi/?chain=Osmosis" }}
      originWhitelist={["https://app.calculated.fi"]}
    />
  );
};
