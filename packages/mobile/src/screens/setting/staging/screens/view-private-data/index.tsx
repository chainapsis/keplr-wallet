import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../../../styles";
import { CheckIcon } from "../../../../../components/staging/icon";
import { Button } from "../../../../../components/staging/button";
import { WordChip } from "../../../../../components/staging/mnemonic";
import Clipboard from "expo-clipboard";
import { PageWithScrollViewInBottomTabView } from "../../../../../components/staging/page";
import { useSimpleTimer } from "../../../../../hooks";
import { RouteProp, useRoute } from "@react-navigation/native";

export const getPrivateDataTitle = (keyRingType: string) => {
  return `View ${keyRingType === "mnemonic" ? "Mnemonic Seed" : "Private key"}`;
};

export const canShowPrivateData = (keyRingType: string): boolean => {
  return keyRingType === "mnemonic" || keyRingType === "privateKey";
};

export const ViewPrivateDataScreen: FunctionComponent = () => {
  const style = useStyle();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          privateData: string;
          privateDataType: string;
        }
      >,
      string
    >
  >();

  const { isTimedOut, setTimer } = useSimpleTimer();

  const privateData = route.params.privateData;
  const privateDataType = route.params.privateDataType;

  const words = privateData.split(" ");

  return (
    <PageWithScrollViewInBottomTabView
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
          {privateDataType === "mnemonic" ? (
            words.map((word, i) => {
              return <WordChip key={i.toString()} index={i + 1} word={word} />;
            })
          ) : (
            <Text style={style.flatten(["h6", "margin-bottom-30"])}>
              {words}
            </Text>
          )}
        </View>
        <View style={style.flatten(["width-full"])}>
          <Button
            textStyle={style.flatten([
              "text-button1",
              isTimedOut ? "color-success" : "color-primary",
            ])}
            {...(isTimedOut && {
              rightIcon: (
                <View style={style.flatten(["margin-left-8"])}>
                  <CheckIcon />
                </View>
              ),
            })}
            mode="text"
            text="Copy to Clipboard"
            onPress={() => {
              Clipboard.setString(words.join(" "));
              setTimer(3000);
            }}
          />
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
};
