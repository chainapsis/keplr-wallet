import React, { FunctionComponent, useState } from "react";
import { TabPanel } from "components/new/tab-panel/tab-panel";
import { LineGraph } from "./line-graph";

export enum DurationFilter {
  "24H" = "24H",
  "1W" = "1W",
  "1M" = "1M",
  "3M" = "3M",
  "1Y" = "1Y",
  ALL = "All",
}

const tabs = [
  {
    index: 0,
    id: DurationFilter["24H"],
    duration: "1",
  },
  {
    index: 1,
    id: DurationFilter["1W"],
    duration: "7",
  },
  {
    index: 2,
    id: DurationFilter["1M"],
    duration: "30",
  },
  {
    index: 3,
    id: DurationFilter["3M"],
    duration: "90",
  },
  {
    index: 4,
    id: DurationFilter["1Y"],
    duration: "365",
  },
  {
    index: 5,
    id: DurationFilter.ALL,
    duration: "max",
  },
];

export const LineGraphView: FunctionComponent<{
  tokenName: string | undefined;
  setTokenState: any;
  tokenState?: any;
  height?: number;
}> = ({ tokenName, setTokenState, height }) => {
  const [activeTab, setActiveTab] = useState<any>(tabs[0]);

  return (
    <React.Fragment>
      <LineGraph
        tokenName={tokenName}
        setTokenState={setTokenState}
        duration={activeTab.duration}
        height={height}
      />
      <TabPanel tabs={tabs} setActiveTab={setActiveTab} activeTab={activeTab} />
    </React.Fragment>
  );
};
