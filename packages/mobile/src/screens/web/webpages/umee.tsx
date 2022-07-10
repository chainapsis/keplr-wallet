import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const UmeeWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Umee"
      source={{ uri: "https://app.umee.cc" }}
      originWhitelist={["https://app.umee.cc"]}
    />
  );
};
