import React from "react";
import style from "./style.module.scss";

export const NoAddress = () => {
  return (
    <div className={style["noAddressContainer"]}>
      <img src={require("@assets/svg/wireframe/no-activity.svg")} alt="" />
      <div className={style["noAddressTitle"]}>
        You haven&apos;t added any addresses yet
      </div>
    </div>
  );
};
