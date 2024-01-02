import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const FetchhubScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Fetchhub"
      source={{ uri: "https://fetch.ai/get-fet" }}
      originWhitelist={["https://fetch.ai/get-fet"]}
    />
  );
};
