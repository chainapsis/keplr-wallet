import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const StreamSwapScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="StreamSwap"
      source={{ uri: "https://app.streamswap.io" }}
      originWhitelist={["https://app.streamswap.io"]}
    />
  );
};
