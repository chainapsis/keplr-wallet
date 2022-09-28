import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const DaoDaoWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="DAO DAO"
      source={{ uri: "https://daodao.zone" }}
      originWhitelist={["https://daodao.zone"]}
    />
  );
};
