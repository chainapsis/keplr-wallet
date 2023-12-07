import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const WYNDDaoWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="WYND Dao"
      source={{ uri: "https://app.wynddao.com" }}
    />
  );
};
