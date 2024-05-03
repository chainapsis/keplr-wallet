import React from "react";
import style from "./style.module.scss";

export const ErrorActivity = () => {
  return (
    <div className={style["noActivityContainer"]}>
      <img src={require("@assets/svg/wireframe/no-activity.svg")} alt="" />
      <div className={style["noActivityTitle"]}>
        Activity can&apos;t be loaded
      </div>
      <div className={style["content"]}>
        Error while loading Activity.
        <br />
        Please try later.
      </div>
    </div>
  );
};
