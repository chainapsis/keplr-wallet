import { CardDivider } from "components/card";
import React, { FunctionComponent, useState } from "react";
import { Dimensions, FlatList, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurButton } from "../button/blur-button";
import { BlurBackground } from "../blur-background/blur-background";

export const TabBarView: FunctionComponent<{
  listItem: any;
  selected: any;
  setSelected: any;
  contentContainerStyle?: ViewStyle;
  containerStyle?: ViewStyle;
}> = ({
  listItem,
  selected,
  setSelected,
  contentContainerStyle,
  containerStyle,
}) => {
  const [prevSelected, setPrevSelected] = useState(0);

  const style = useStyle();

  const renderItem = ({ item }: any) => {
    const select = selected === item;
    return (
      <BlurButton
        backgroundBlur={false}
        borderRadius={10}
        text={item}
        textStyle={
          style.flatten(
            ["text-caption1"],
            [select && "color-indigo-900"]
          ) as ViewStyle
        }
        containerStyle={
          [
            style.flatten(
              ["justify-center"],
              [select && "background-color-white"]
            ),
            {
              width:
                (Dimensions.get("window").width -
                  (43 + Object.values(listItem).length)) /
                Object.values(listItem).length,
            },
          ] as ViewStyle
        }
        onPress={() => {
          setSelected(item);
          setPrevSelected(Object.values(listItem).indexOf(item) - 1);
        }}
      />
    );
  };

  const renderSeparator = (item: any) => {
    const select = item.leadingItem === selected;
    const prevSelect =
      Object.values(listItem).indexOf(item.leadingItem) === prevSelected;

    return (
      <View>
        {!select && !prevSelect ? (
          <CardDivider
            vertical={true}
            style={style.flatten(["height-12", "margin-top-10"]) as ViewStyle}
          />
        ) : null}
      </View>
    );
  };

  return (
    <BlurBackground
      borderRadius={12}
      containerStyle={
        [
          style.flatten(["margin-y-10", "padding-2"]),
          containerStyle,
        ] as ViewStyle
      }
    >
      <FlatList
        data={Object.values(listItem)}
        renderItem={renderItem}
        horizontal={true}
        extraData={selected}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={contentContainerStyle}
        scrollEnabled={false}
      />
    </BlurBackground>
  );
};
