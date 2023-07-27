import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";
import style from "./style.module.scss";

interface TabProps {
  title: string;
  icon: any;
  path: string;
  disabled: boolean;
  tooltip?: string;
}

export const Tab = ({ title, icon, path, disabled, tooltip }: TabProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatActive =
    title == "Chat" &&
    (location.pathname == "/new-chat" ||
      location.pathname.startsWith("/chat/"));
  const isActive = path === location.pathname || isChatActive;

  return (
    <div
      id={title}
      className={`${style["tab"]} ${
        isActive ? style["active"] : disabled ? style["disabled"] : null
      }`}
      onClick={() => {
        if (!disabled) {
          navigate(path);
        }
      }}
    >
      <img src={icon} draggable={false} alt="tab" />
      <div className={style["title"]}>{title}</div>
      {disabled && (
        <UncontrolledTooltip placement="top" target={title}>
          {tooltip}
        </UncontrolledTooltip>
      )}
    </div>
  );
};
