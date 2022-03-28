import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { PageWithView } from "../../../../components/page";
import DraggableFlatList, {
  OpacityDecorator,
} from "react-native-draggable-flatlist";
import { useStore } from "../../../../stores";
import { Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { Toggle } from "../../../../components/toggle";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../../components/vector-character";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export const SettingChainListScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <PageWithView>
      <DraggableFlatList
        style={{ height: 500 }}
        data={chainStore.chainInfosInUI.map((chainInfo) => {
          return {
            chainId: chainInfo.chainId,
            chainName: chainInfo.chainName,
            chainSymbolImageUrl: chainInfo.raw.chainSymbolImageUrl,
          };
        })}
        keyExtractor={(item) => item.chainId}
        renderItem={({ item, drag }) => {
          return <SettingChainListScreenElement {...item} drag={drag} />;
        }}
      />
    </PageWithView>
  );
});

export const SettingChainListScreenElement: FunctionComponent<{
  chainName: string;
  chainSymbolImageUrl: string | undefined;

  drag: () => void;
}> = ({ chainName, chainSymbolImageUrl, drag }) => {
  const style = useStyle();

  return (
    <OpacityDecorator>
      <TouchableWithoutFeedback onLongPress={drag}>
        <View
          style={style.flatten([
            "padding-x-16",
            "flex-row",
            "height-83",
            "items-center",
          ])}
        >
          <View
            style={style.flatten([
              "width-44",
              "height-44",
              "border-radius-64",
              "items-center",
              "justify-center",
              "background-color-black",
            ])}
          >
            {chainSymbolImageUrl ? (
              <FastImage
                style={{
                  width: 32,
                  height: 32,
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: chainSymbolImageUrl,
                }}
              />
            ) : (
              <VectorCharacter char={chainName[0]} color="white" height={15} />
            )}
          </View>
          <View style={style.flatten(["justify-center", "margin-left-10"])}>
            <Text style={style.flatten(["h5", "color-text-black-high"])}>
              {chainName}
            </Text>
          </View>
          <View style={style.get("flex-1")} />
          <View style={style.flatten(["margin-right-12"])}>
            <Toggle
              on={true}
              onChange={(value) => {
                console.log(value);
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </OpacityDecorator>
  );
};
