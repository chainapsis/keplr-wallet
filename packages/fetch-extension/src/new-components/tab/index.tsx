import React from "react";
import style from "./style.module.scss";

interface TabProps {
  tabName: string;
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

interface TabComponentProps {
  tabs: { tabName: string; displayName: string }[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export const Tab: React.FC<TabComponentProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  const TabItem: React.FC<TabProps> = ({ tabName, children }) => (
    <div
      className={`${style["tab"]} ${
        activeTab === tabName ? style["active"] : ""
      }`}
      onClick={() => handleTabClick(tabName)}
    >
      {children}
    </div>
  );

  return (
    <div className={style["tabContainer"]}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.tabName}
          tabName={tab.tabName}
          activeTab={activeTab}
          onTabChange={onTabChange}
        >
          {tab.displayName}
        </TabItem>
      ))}
    </div>
  );
};
