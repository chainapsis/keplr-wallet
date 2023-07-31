import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const LevanaWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Levana Perps"
      source={{ uri: "https://trade.levana.finance" }}
      originWhitelist={["https://trade.levana.finance"]}
    />
  );
};
