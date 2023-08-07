import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const CalcFiWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Calc Finance"
      source={{
        uri:
          "https://app.calculated.fi/create-strategy/dca-in/assets/?chain=Osmosis&utm_source=kplr",
      }}
      originWhitelist={["https://app.calculated.fi"]}
    />
  );
};
