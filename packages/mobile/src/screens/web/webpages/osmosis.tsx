import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const OsmosisWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      source={{ uri: "https://app.osmosis.zone" }}
      originWhitelist={["https://app.osmosis.zone"]}
    />
  );
};
