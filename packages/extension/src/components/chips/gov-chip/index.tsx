import React, { FunctionComponent } from "react";
import style from "./style.module.scss";

interface Props {
  name: string;
  selectedIndex: number;
  id: number;
  handleCheck?: (id: number) => void;
  filter?: boolean;
  color?: string;
  background?: string;
  icon?: string;
}
export const GovStatusChip: FunctionComponent<Props> = (props) => {
  const {
    selectedIndex,
    name,
    id,
    filter,
    color,
    icon,
    background,
    handleCheck,
  } = props;
  return (
    <span className={style.topicChips}>
      <label className={style.switch}>
        <input
          type="checkbox"
          checked={id === selectedIndex}
          onChange={() => {
            if (handleCheck) handleCheck(id);
          }}
          id={name}
        />
        <span
          className={filter ? style.contentInverter : style.govStatus}
          style={{ backgroundColor: background, color: color }}
        >
          {icon && (
            <img draggable={false} src={require("@assets/svg/" + icon)} />
          )}
          {name}
        </span>
      </label>
    </span>
  );
};
