import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const StaykingWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Stayking"
      source={{ uri: "https://app.stayking.zone" }}
      originWhitelist={["https://app.stayking.zone"]}
    />
  );
};
