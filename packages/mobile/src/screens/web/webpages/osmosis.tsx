import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const OsmosisWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Osmosis"
      source={{ uri: "https://app.osmosis.zone" }}
      originWhitelist={["https://app.osmosis.zone"]}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};

export const OsmosisFrontierWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Osmosis"
      source={{ uri: "https://frontier.osmosis.zone" }}
      originWhitelist={["https://frontier.osmosis.zone"]}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};
