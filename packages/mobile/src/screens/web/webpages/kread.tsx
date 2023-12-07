import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const KreadWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="KREAd"
      source={{
        uri: "https://kread.app",
      }}
    />
  );
};
