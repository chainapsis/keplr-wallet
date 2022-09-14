import React from "react";

import { Tab } from "./tab";

import style from "./style.module.scss";
import homeTabBlueIcon from "../../public/assets/icon/home-blue.png";
import homeTabGreyIcon from "../../public/assets/icon/home-grey.png";
import clockTabBlueIcon from "../../public/assets/icon/clock-blue.png";
import clockTabGreyIcon from "../../public/assets/icon/clock-grey.png";
import moreTabBlueIcon from "../../public/assets/icon/more-blue.png";
import moreTabGreyIcon from "../../public/assets/icon/more-grey.png";
import chatTabBlueIcon from "../../public/assets/icon/chat-blue.png";
import chatTabGreyIcon from "../../public/assets/icon/chat-grey.png";

export const BottomNav = () => {
  const bottomNav = [
    {
      title: "Home",
      icon: homeTabGreyIcon,
      activeTabIcon: homeTabBlueIcon,
      path: "/",
      disabled: false,
    },
    {
      title: "Activity",
      icon: clockTabGreyIcon,
      activeTabIcon: clockTabBlueIcon,
      path: "/activity",
      disabled: true,
    },
    {
      title: "Chat",
      icon: chatTabGreyIcon,
      activeTabIcon: chatTabBlueIcon,
      path: "/chat",
      disabled: true,
    },
    {
      title: "More",
      icon: moreTabGreyIcon,
      activeTabIcon: moreTabBlueIcon,
      path: "/more",
      disabled: false,
    },
  ];

  return (
    <div className={style.bottomNavContainer}>
      {bottomNav.map((nav, index) => (
        <Tab
          key={index}
          title={nav.title}
          icon={nav.icon}
          activeTabIcon={nav.activeTabIcon}
          path={nav.path}
          disabled={nav.disabled}
        />
      ))}
    </div>
  );
};
