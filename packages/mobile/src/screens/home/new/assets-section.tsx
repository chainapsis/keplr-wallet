import React, { FunctionComponent, useState } from "react";
import {
  FlatList,
  Text,
  // TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { BlurButton } from "components/new/button/blur-button";
import { useStyle } from "styles/index";
// import { TokenCardView } from "components/new/card-view/token-card-view";
// import { FetchAiIcon } from "components/icon/new/fetchai-icon";
// import Toast from "react-native-toast-message";

export const AssetsSection: FunctionComponent<{
  containtStyle?: ViewStyle;
}> = ({ containtStyle }) => {
  const style = useStyle();
  const [selectId, setSelectedId] = useState<string>("1");

  const assertsSectionList = [
    { id: "1", title: "Tokens" },
    { id: "2", title: "NTFs" },
    { id: "3", title: ".FET Domains" },
  ];

  const renderItem = ({ item }: any) => {
    const selected = selectId === item.id;
    return (
      <BlurButton
        backgroundBlur={selected}
        text={item.title}
        onPress={() => setSelectedId(item.id)}
      />
    );
  };

  return (
    <View style={[style.flatten(["margin-x-16"]) as ViewStyle, containtStyle]}>
      <Text style={style.flatten(["h2", "color-white"]) as ViewStyle}>
        {"Your assets"}
      </Text>
      <View style={style.flatten(["margin-y-20"]) as ViewStyle}>
        <FlatList
          data={assertsSectionList}
          renderItem={renderItem}
          horizontal={true}
          keyExtractor={(item) => item.id}
          extraData={selectId}
        />
      </View>
      {/* <TouchableOpacity
        activeOpacity={0.6}
        onPress={() =>
          Toast.show({
            type: "error",
            text1: "Fetch.AI is working",
          })
        }
      >
        <TokenCardView
          containerStyle={
            style.flatten(["margin-bottom-card-gap"]) as ViewStyle
          }
        />
      </TouchableOpacity> */}
    </View>
  );
};
