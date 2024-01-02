import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const JunoswapWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Junoswap"
      source={{ uri: "https://junoswap.com" }}
      originWhitelist={["https://junoswap.com"]}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};
