import React from "react";
import style from "./style.module.scss";

export const ToggleSwitchButton = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <div>
      <label className={style["switch"]}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className={style["slider"]} />
      </label>
    </div>
  );
};
