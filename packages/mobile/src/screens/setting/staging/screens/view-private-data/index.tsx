import React, { FunctionComponent, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../../../styles";
import { Button } from "../../../../../components/staging/button";
import { observer } from "mobx-react-lite";
import { WordChip } from "../../../../../components/staging/mnemonic";
import Clipboard from "expo-clipboard";
import { PageWithScrollView } from "../../../../../components/staging/page";

export const ViewPrivateDataScreen: FunctionComponent<{
  route: {
    params: {
      privateData: string;
      privateDataType: string;
    };
  };
}> = observer(
  ({
    route: {
      params: { privateData, privateDataType },
    },
  }) => {
    const style = useStyle();

    const words = privateData.split(" ");

    return (
      <PageWithScrollView
        contentContainerStyle={style.get("flex-grow-1")}
        style={style.flatten(["padding-x-page"])}
      >
        <Text style={style.flatten(["h4", "margin-y-24", "text-center"])}>
          Guide Sentence
        </Text>
        <View
          style={style.flatten([
            "padding-top-24",
            "padding-bottom-12",
            "padding-x-24",
            "background-color-white",
          ])}
        >
          <View style={style.flatten(["flex-row", "flex-wrap"])}>
            {privateDataType !== "mnemonic" ? (
              words.map((word, i) => {
                return (
                  <WordChip key={i.toString()} index={i + 1} word={word} />
                );
              })
            ) : (
              <Text style={style.flatten(["h6", "margin-bottom-30"])}>
                {words}
              </Text>
            )}
          </View>
          <View style={style.flatten(["width-full"])}>
            <Button
              textStyle={style.flatten(["text-button1"])}
              mode="text"
              text="Copy to Clipboard"
              onPress={() => {
                Clipboard.setString(words.join(" "));
              }}
            />
          </View>
        </View>
      </PageWithScrollView>
    );
  }
);
