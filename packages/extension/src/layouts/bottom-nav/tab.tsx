import React from "react";
import { useLocation, useHistory } from "react-router-dom";

import style from "./style.module.scss";

interface TabProps {
  title: string;
  icon: string;
  activeTabIcon: string;
  path: string;
}

export const Tab = ({ title, icon, activeTabIcon, path }: TabProps) => {
  const history = useHistory();
  const location = useLocation();

  const isActive = path === location.pathname;

  return (
    <div
      className={`${style.tab} ${isActive ? style.active : null}`}
      onClick={() => history.push(path)}
    >
      <img src={isActive ? activeTabIcon : icon} alt="tab" />
      <div className={style.title}>{title}</div>
    </div>
  );
};
