import React, { useState } from "react";
import { useHistory } from "react-router";
import { Tab } from "@new-components/tab";
import { YourDomain } from "./your-domain";
import { HeaderLayout } from "@new-layouts";
import { ExploreDomain } from "./explore-domain";

const tabs = [
  { tabName: "explore", displayName: "EXPLORE" },
  { tabName: "yourDomain", displayName: "YOUR DOMAIN" },
];

export const FetchnameService = () => {
  const history = useHistory();

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
        history.push("/");
      }}
      showBottomMenu={true}
    >
      <Tab tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "explore" ? <ExploreDomain /> : <YourDomain />}
    </HeaderLayout>
  );
};
