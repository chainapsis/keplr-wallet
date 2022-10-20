import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const RegenWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Regen"
      source={{ uri: "https://app.regen.network" }}
      originWhitelist={["https://app.regen.network"]}
    />
  );
};
