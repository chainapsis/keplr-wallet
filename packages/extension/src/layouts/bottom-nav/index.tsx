import React from "react";

import { Tab } from "./tab";

import style from "./style.module.scss";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import homeTabBlueIcon from "../../public/assets/icon/home-blue.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import homeTabGreyIcon from "../../public/assets/icon/home-grey.png";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import clockTabBlueIcon from "../../public/assets/icon/clock-blue.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import clockTabGreyIcon from "../../public/assets/icon/clock-grey.png";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import moreTabBlueIcon from "../../public/assets/icon/more-blue.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import moreTabGreyIcon from "../../public/assets/icon/more-grey.png";

export const BottomNav = () => {
  const bottomNav = [
    {
      title: "Home",
      icon: homeTabGreyIcon,
      activeTabIcon: homeTabBlueIcon,
      path: "/",
    },
    {
      title: "Activity",
      icon: clockTabGreyIcon,
      activeTabIcon: clockTabBlueIcon,
      path: "/activity",
    },
    {
      title: "More",
      icon: moreTabGreyIcon,
      activeTabIcon: moreTabBlueIcon,
      path: "/more",
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
        />
      ))}
    </div>
  );
};
