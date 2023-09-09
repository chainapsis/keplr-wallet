import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const PStakeWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="pSTAKE"
      source={{ uri: "https://cosmos.pstake.finance" }}
    />
  );
};
