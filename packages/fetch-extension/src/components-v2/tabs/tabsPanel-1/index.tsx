import React from "react";
import style from "./style.module.scss";

export interface TabsProps {
  tabs: any[];
  activeTab: any;
  setActiveTab: any;
}

export const TabsPanel: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
}) => {
  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };
  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab.id);

  return (
    <div className={style["tab-container"]}>
      <div className={style["tab-bar"]}>
        {tabs.map((tab, index) => {
          const isSelected = tab.id === activeTab.id;
          return (
            <React.Fragment key={tab.id}>
              <button
                className={`${style["tab"]} ${
                  isSelected ? style["selected"] : ""
                }`}
                style={{
                  color: `${isSelected ? "#FFF" : "rgba(255,255,255,0.6)"}`,
                  background: `${
                    isSelected ? "rgba(255,255,255,0.1)" : "transparent"
                  }`,
                  border: `${isSelected ? "transparent" : "white"}`,
                  borderRadius: `${isSelected ? "100px" : "0px"}`,
                }}
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                disabled={tab.disabled || false}
              >
                {tab.id}
              </button>
              {index < tabs.length - 1 &&
                index !== activeTabIndex - 1 &&
                !isSelected && (
                  <img
                    src={require("@assets/svg/wireframe/line-1.svg")}
                    alt=""
                    className={style["vertical-line"]}
                  />
                )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
