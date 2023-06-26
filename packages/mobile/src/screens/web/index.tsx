import React, { FunctionComponent, useMemo, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LabelSelector } from "./components/label-selector";
import {
  DaoDaoItem,
  InjectiveItem,
  Item,
  MarsItem,
  OsmosisFrontierItem,
  OsmosisItem,
  RegenItem,
  StargazeItem,
  StrideItem,
  UmeeItem,
  WYNDDaoItem,
  PStakeItem,
  StreamSwapItem,
  IBCXItem,
  IONDaoItem,
} from "./constants";
import { WebpageImageButton } from "./common";

const WebpagesPerLabel: {
  label: string;
  items: Item[];
}[] = [
  {
    label: "All",
    items: [
      OsmosisItem,
      StargazeItem,
      WYNDDaoItem,
      DaoDaoItem,
      InjectiveItem,
      OsmosisFrontierItem,
      MarsItem,
      UmeeItem,
      StrideItem,
      PStakeItem,
      RegenItem,
      StreamSwapItem,
      IBCXItem,
      IONDaoItem,
    ],
  },
  {
    label: "Defi",
    items: [
      OsmosisItem,
      WYNDDaoItem,
      InjectiveItem,
      OsmosisFrontierItem,
      MarsItem,
      UmeeItem,
      StrideItem,
      PStakeItem,
      StreamSwapItem,
      IBCXItem,
    ],
  },
  {
    label: "NFT",
    items: [StargazeItem],
  },
  {
    label: "DAO",
    items: [DaoDaoItem, IONDaoItem],
  },
  {
    label: "Refi",
    items: [RegenItem],
  },
];

export const WebScreen: FunctionComponent = () => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();

  const [selectedLabelKey, setSelectedLabelKey] = useState(
    WebpagesPerLabel[0].label
  );

  const webpages = useMemo(() => {
    return WebpagesPerLabel.find((label) => label.label === selectedLabelKey)!;
  }, [selectedLabelKey]);

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode="gradient"
      contentContainerStyle={style.get("flex-grow-1")}
      style={StyleSheet.flatten([
        style.flatten(["padding-x-20"]),
        {
          marginTop: safeAreaInsets.top,
        },
      ])}
    >
      <Text
        style={style.flatten([
          "h1",
          "color-text-high",
          "margin-top-44",
          "margin-bottom-20",
        ])}
      >
        Discover Apps
      </Text>
      <LabelSelector
        selectedKey={selectedLabelKey}
        labels={WebpagesPerLabel.map((label) => {
          return {
            key: label.label,
            label: label.label,
          };
        })}
        onLabelSelect={setSelectedLabelKey}
      />
      {webpages.items.map((item) => {
        return <item.component key={item.key} />;
      })}
      <WebpageImageButton
        overrideInner={
          <View style={style.flatten(["flex-1", "items-center"])}>
            <Text
              style={style.flatten([
                "h4",
                "color-gray-200",
                "dark:color-platinum-300",
              ])}
            >
              Coming soon
            </Text>
          </View>
        }
      />
    </PageWithScrollViewInBottomTabView>
  );
};
