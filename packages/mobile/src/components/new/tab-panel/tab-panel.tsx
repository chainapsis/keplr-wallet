import React, { FunctionComponent, useState } from "react";
import { Dimensions, FlatList, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurButton } from "../button/blur-button";
import { CardDivider } from "components/card";

export const TabPanel: FunctionComponent<{
  tabs: any[];
  activeTab: any;
  setActiveTab: any;
}> = ({ tabs, activeTab, setActiveTab }) => {
  const style = useStyle();
  const [prevSelectedId, setPrevSelectedId] = useState<any>(tabs[0].index);

  const renderItem = ({ item }: any) => {
    const selected = item.id === activeTab.id;
    return (
      <BlurButton
        backgroundBlur={selected}
        disable={selected}
        text={item.id}
        borderRadius={32}
        textStyle={
          style.flatten(
            ["text-caption1"],
            [selected ? "color-white" : "color-white@60%"]
          ) as ViewStyle
        }
        containerStyle={
          [
            style.flatten(["justify-center"]),
            {
              width:
                (Dimensions.get("window").width - (40 + tabs.length)) /
                tabs.length,
            },
          ] as ViewStyle
        }
        onPress={() => {
          setActiveTab(item);
          setPrevSelectedId(item.index - 1);
        }}
      />
    );
  };

  const renderSeparator = (item: any) => {
    const selected = item.leadingItem.id === activeTab.id;
    const prevSelected = item.leadingItem.index === prevSelectedId;
    return (
      <View>
        {!selected && !prevSelected ? (
          <CardDivider
            vertical={true}
            style={style.flatten(["height-12", "margin-y-10"]) as ViewStyle}
          />
        ) : null}
      </View>
    );
  };

  return (
    <View style={style.flatten(["margin-x-20", "margin-y-20"]) as ViewStyle}>
      <FlatList
        data={tabs}
        renderItem={renderItem}
        horizontal={true}
        keyExtractor={(item) => item.id}
        extraData={activeTab.id}
        contentContainerStyle={[
          style.flatten(["justify-between", "width-full"]) as ViewStyle,
        ]}
        ItemSeparatorComponent={renderSeparator}
      />
    </View>
  );
};
