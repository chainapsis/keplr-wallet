import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const IBCXWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen name="IBCX" source={{ uri: "https://index.ion.wtf" }} />
  );
};
