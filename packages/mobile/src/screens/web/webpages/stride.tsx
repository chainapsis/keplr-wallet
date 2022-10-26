import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const StrideWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Stride"
      source={{ uri: "https://app.stride.zone" }}
      originWhitelist={["https://app.stride.zone"]}
    />
  );
};
