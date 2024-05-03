import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import { Card } from "@components-v2/card";

interface Props {
  name: string;
  isChecked: boolean;
  handleOnChange: () => void;
}

export const NotificationOption: FunctionComponent<Props> = (props) => {
  const { name, isChecked, handleOnChange } = props;

  return (
    <Card
      heading={name}
      rightContent={
        <label className={style["switch"]}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleOnChange}
          />
          <span className={style["slider"]} />
        </label>
      }
    />
  );
};
