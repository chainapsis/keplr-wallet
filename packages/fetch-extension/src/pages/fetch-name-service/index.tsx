import { Tab } from "@new-components/tab";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import { HeaderLayout } from "../../new-layouts";
import { ExploreDomain } from "./explore-domain";
import { YourDomain } from "./your-domain";

const tabs = [
  { tabName: "explore", displayName: "Explore" },
  { tabName: "yourDomain", displayName: "Your Domain" },
];

export const FetchnameService = () => {
  const navigate = useNavigate();
  const tabName = useLocation().pathname.split("/")[2];

  const handleTabChange = (tabName: React.SetStateAction<string>) => {
    navigate("/fetch-name-service/" + tabName);
  };
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Fetch Name Server"}
      onBackButton={() => {
        navigate("/more");
      }}
      showBottomMenu={true}
    >
      <Tab tabs={tabs} activeTab={tabName} onTabChange={handleTabChange} />

      {tabName === "explore" ? <ExploreDomain /> : <YourDomain />}
    </HeaderLayout>
  );
};
