import { TabsPanel } from "@components-v2/tabs/tabsPanel-1";
import React, { useState } from "react";
import { LineGraph } from "./line-graph";
import style from "./style.module.scss";

interface LineGraphViewProps {
  tokenName: string | undefined;
  setTokenState: any;
  tokenState: any;
}

const tabs = [
  {
    id: "24H",
    duration: 1,
  },
  {
    id: "1W",
    duration: 7,
  },
  {
    id: "1M",
    duration: 30,
  },
  {
    id: "3M",
    duration: 90,
  },
  {
    id: "1Y",
    duration: 360,
  },
  {
    id: "All",
    duration: 3600,
  },
];

export const LineGraphView: React.FC<LineGraphViewProps> = ({
  tokenName,
  setTokenState,
  tokenState,
}) => {
  const [activeTab, setActiveTab] = useState<any>(tabs[0]);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <div className={style["graph-container"]}>
      {!loading && !tokenState?.diff && (
        <div className={style["errorText"]}>Line Graph unavailable</div>
      )}
      <LineGraph
        duration={activeTab.duration}
        tokenName={tokenName}
        setTokenState={setTokenState}
        loading={loading}
        setLoading={setLoading}
      />
      {tokenState?.diff && (
        <TabsPanel
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
};
