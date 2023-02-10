import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const MarsWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Mars Hub"
      source={{ uri: "https://osmosis.marsprotocol.io" }}
      originWhitelist={["https://osmosis.marsprotocol.io"]}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};
