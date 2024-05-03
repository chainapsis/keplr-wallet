import React, { FC } from "react";
import style from "./style.module.scss";

export interface Props {
  title: string;
  image: any;
  onClick: () => void;
  disabled?: boolean;
}

export const ActionButton: FC<Props> = ({
  title,
  image,
  onClick,
  disabled,
}) => {
  return (
    <button disabled={disabled} className={style["action"]} onClick={onClick}>
      <img src={require(`@assets/svg/wireframe/${image}`)} alt="" />
      <div className={style["img-title"]}>{title}</div>
    </button>
  );
};
