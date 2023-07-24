import React, { FunctionComponent } from "react";
import style from "./style.module.scss";

interface Props {
  name: string;
  isChecked: boolean;
  handleOnChange: () => void;
}

export const NotificationOption: FunctionComponent<Props> = (props) => {
  const { name, isChecked, handleOnChange } = props;

  return (
    <div className={style["notificationOptionContainer"]}>
      <label className={style["switch"]}>
        <input type="checkbox" checked={isChecked} onChange={handleOnChange} />
        <span className={style["slider"]} />
      </label>

      <p className={style["notificationOption"]}>{name}</p>
    </div>
  );
};
