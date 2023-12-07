import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const LikerWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Liker Land"
      source={{ uri: "https://liker.land/keplr" }}
    />
  );
};
