import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const QuasarWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen name="Quasar" source={{ uri: "https://app.quasar.fi" }} />
  );
};
