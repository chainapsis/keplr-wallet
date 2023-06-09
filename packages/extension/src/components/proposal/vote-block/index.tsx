import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import classNames from "classnames";
interface Props {
  title: string;
  icon: string;
  color: string;
  activeColor: string;
  id: number;
  selected: number;
  handleClick: any;
  closed: boolean;
}
export const VoteBlock: FunctionComponent<Props> = (props) => {
  const {
    title,
    icon,
    color,
    activeColor,
    id,
    selected,
    handleClick,
    closed,
  } = props;
  const isSelected = id === selected;
  const bgColor = isSelected ? activeColor : color;
  const txtColor = isSelected ? "white" : "#525F7F";
  const Icon = isSelected ? icon + "-white" : icon;
  const cursor = closed ? "not-allowed" : "pointer";
  return (
    <div
      className={classNames(style.voteBlock)}
      style={{ backgroundColor: bgColor, cursor: cursor }}
      onClick={() => handleClick(id)}
    >
      <img
        className={style.voteImage}
        src={require(`@assets/svg/${Icon}.svg`)}
      />
      <p className={style.voteText} style={{ color: txtColor }}>
        {title}
      </p>
    </div>
  );
};
