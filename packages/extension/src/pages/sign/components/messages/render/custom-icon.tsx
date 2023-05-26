import React, { FunctionComponent } from "react";
import { Image } from "../../../../../components/image";

export const CustomIcon: FunctionComponent = () => {
  return (
    <Image
      alt="icns-icon"
      src={require("../../../../../public/assets/img/sign-custom.png")}
      style={{ width: "3rem", height: "3rem" }}
    />
  );
};
