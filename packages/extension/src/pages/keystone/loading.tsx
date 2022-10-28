import React from "react";
import style from "./style.module.scss";

interface Props {
  title?: string;
}

export function Loading({ title }: Props) {
  return (
    <div className={style.modal}>
      <div className={style["modal-content"]}>
        <img
          className={style["loading-icon"]}
          src={require("../../public/assets/svg/loading.svg")}
          height="24"
        />
        {title && <div className={style["loading-title"]}>{title}</div>}
      </div>
    </div>
  );
}
