import React from "react";
import style from "./style.module.scss";

export const UnsupportedNetwork = ({ chainID }: { chainID: string }) => {
  return (
    <div className={style["noActivityContainer"]}>
      <img src={require("@assets/svg/wireframe/no-activity.svg")} alt="" />
      <div className={style["noActivityTitle"]}>Unsupported Network</div>
      <div className={style["content"]}>
        {chainID} Network is currently not supported.
      </div>
    </div>
  );
};
