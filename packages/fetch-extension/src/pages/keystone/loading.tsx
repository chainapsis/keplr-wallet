import React from "react";
import style from "./style.module.scss";

interface Props {
  title?: string;
}

export function Loading({ title }: Props) {
  return (
    <div className={style["modal"]}>
      <div className={style["modalContent"]}>
        <img
          className={style["loadingIcon"]}
          src={require("../../public/assets/svg/loading.svg")}
          height="24"
        />
        {title && <div className={style["loadingTitle"]}>{title}</div>}
      </div>
    </div>
  );
}
