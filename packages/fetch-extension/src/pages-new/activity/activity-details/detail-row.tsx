import React from "react";
import style from "./style.module.scss";

export const DetailRow = ({ label, value }: { label: string; value: any }) => {
  return (
    <React.Fragment>
      <div className={style["container"]}>
        <div>{label}</div>
        <div className={style["version"]}>{value}</div>
      </div>
      <div className={style["hr"]} />
    </React.Fragment>
  );
};
