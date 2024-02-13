import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";
// import { ToolTip } from "@components/tooltip";

import style from "./style.module.scss";
import { useStore } from "../../stores";

interface TabProps {
  title: string;
  icon: string;
  activeTabIcon: string;
  path: string;
  disabled: boolean;
  tooltip?: string;
}

export const Tab = ({
  title,
  icon,
  activeTabIcon,
  path,
  disabled,
  tooltip,
}: TabProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analyticsStore } = useStore();

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
          if (path !== "/") {
            analyticsStore.logEvent(`${title.toLowerCase()}_tab_click`);
          }
          navigate(path);
        }
      }}
    >
      <img draggable={false} src={isActive ? activeTabIcon : icon} alt="tab" />
      <div className={style["title"]}>{title}</div>
      {disabled && (
        <UncontrolledTooltip placement="top" target={title}>
          {tooltip}
        </UncontrolledTooltip>
      )}
    </div>
  );
};
