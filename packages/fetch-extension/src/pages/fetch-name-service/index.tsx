import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Tab } from "@new-components/tab";
import { YourDomain } from "./your-domain";
import { HeaderLayout } from "../../new-layouts";
import { ExploreDomain } from "./explore-domain";

const tabs = [
  { tabName: "explore", displayName: "EXPLORE" },
  { tabName: "yourDomain", displayName: "YOUR DOMAIN" },
];

export const FetchnameService = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(tabs[0].tabName);

  const handleTabChange = (tabName: React.SetStateAction<string>) => {
    setActiveTab(tabName);
  };
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Fetch Name Server"}
      onBackButton={() => {
        navigate("/");
      }}
      showBottomMenu={true}
    >
      <Tab tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "explore" ? <ExploreDomain /> : <YourDomain />}
    </HeaderLayout>
  );
};
