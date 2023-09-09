import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const InjectiveWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Injective"
      source={{ uri: "https://hub.injective.network" }}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};
