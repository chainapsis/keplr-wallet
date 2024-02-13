import { Tab } from "@new-components/tab";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import { HeaderLayout } from "../../new-layouts";
import { ExploreDomain } from "./explore-domain";
import { YourDomain } from "./your-domain";
import { useStore } from "../../stores";

const tabs = [
  { tabName: "explore", displayName: "Explore" },
  { tabName: "yourDomain", displayName: "Your Domain" },
];

export const FetchnameService = () => {
  const navigate = useNavigate();
  const tabName = useLocation().pathname.split("/")[2];
  const { analyticsStore } = useStore();

  const handleTabChange = (tabName: React.SetStateAction<string>) => {
    analyticsStore.logEvent(`fns_${tabName}_tab_click`);
    navigate("/fetch-name-service/" + tabName);
  };
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Fetch Name Server"}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Fetch Name Server",
        });
        navigate("/more");
      }}
      showBottomMenu={true}
    >
      <Tab tabs={tabs} activeTab={tabName} onTabChange={handleTabChange} />

      {tabName === "explore" ? <ExploreDomain /> : <YourDomain />}
    </HeaderLayout>
  );
};
