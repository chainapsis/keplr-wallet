import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const IONDaoWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="ION DAO"
      source={{ uri: "https://ion.wtf" }}
      originWhitelist={[
        "https://ion.wtf",
        "https://app.osmosis.zone",
        "https://index.ion.wtf",
      ]}
    />
  );
};
