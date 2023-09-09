import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const DexterWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen name="Dexter" source={{ uri: "https://app.dexter.zone" }} />
  );
};
