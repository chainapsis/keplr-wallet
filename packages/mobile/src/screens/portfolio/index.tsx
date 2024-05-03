import React, { FunctionComponent, useRef, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "components/page";
import { observer } from "mobx-react-lite";
import { StakingCard } from "components/new/staking/staking-card";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

import { NativeTokensSection } from "screens/portfolio/native-tokens-section";
import { TokensSection } from "screens/portfolio/tokens-section";
import { TabBarView } from "components/new/tab-bar/tab-bar";

enum AssetsSectionEnum {
  Tokens = "Tokens",
  Stats = "Stats",
}

export const PortfolioScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [selectedId, setSelectedId] = useState(AssetsSectionEnum.Tokens);

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode={"image"}
      style={style.flatten(["padding-x-page", "overflow-scroll"]) as ViewStyle}
      ref={scrollViewRef}
    >
      <Text
        style={
          style.flatten([
            "h1",
            "color-white",
            "margin-y-10",
            "font-normal",
          ]) as ViewStyle
        }
      >
        Portfolio
      </Text>
      <TabBarView
        listItem={AssetsSectionEnum}
        selected={selectedId}
        setSelected={setSelectedId}
      />
      {selectedId === AssetsSectionEnum.Tokens && (
        <View style={style.flatten(["margin-y-10"]) as ViewStyle}>
          <NativeTokensSection />
          <TokensSection />
        </View>
      )}
      {selectedId === AssetsSectionEnum.Stats && (
        <StakingCard cardStyle={style.flatten(["margin-y-14"]) as ViewStyle} />
      )}
    </PageWithScrollViewInBottomTabView>
  );
});
