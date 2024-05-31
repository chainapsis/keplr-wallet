import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import { Card } from "@components-v2/card";

interface Props {
  name: string;
  isChecked: boolean;
  handleOnChange: () => void;
  cardStyles?: any;
  inActiveBackground?: any;
}

export const NotificationOption: FunctionComponent<Props> = (props) => {
  const { name, isChecked, handleOnChange, cardStyles, inActiveBackground } =
    props;

  return (
    <Card
      heading={name}
      style={{
        ...cardStyles,
      }}
      inActiveBackground={
        inActiveBackground ? inActiveBackground : "transparent"
      }
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
