import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const OsmosisWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Osmosis"
      source={{ uri: "https://40b25c93.osmosis-frontend.pages.dev" }}
      originWhitelist={["https://40b25c93.osmosis-frontend.pages.dev"]}
    />
  );
};
