import React from "react";
import style from "./style.module.scss";

export const NoToken = () => {
  return (
    <div className={style["noTokenContainer"]}>
      <img src={require("@assets/svg/wireframe/no-activity.svg")} alt="" />
      <div className={style["noTokenTitle"]}>
        You haven’t added any tokens yet
      </div>
    </div>
  );
};
