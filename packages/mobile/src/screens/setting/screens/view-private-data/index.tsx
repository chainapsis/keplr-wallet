import React, { FunctionComponent, useEffect } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../../styles";
import { CheckIcon } from "../../../../components/icon";
import { Button } from "../../../../components/button";
import { WordChip } from "../../../../components/mnemonic";
import Clipboard from "expo-clipboard";
import { PageWithScrollViewInBottomTabView } from "../../../../components/page";
import { useSimpleTimer } from "../../../../hooks";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

export const getPrivateDataTitle = (
  keyRingType: string,
  capitalize?: boolean
) => {
  if (capitalize) {
    return `View ${
      keyRingType === "mnemonic" ? "Mnemonic Seed" : "Private Key"
    }`;
  }

  return `View ${keyRingType === "mnemonic" ? "mnemonic seed" : "private key"}`;
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

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: getPrivateDataTitle(route.params.privateDataType, true),
    });
  }, [navigation, route.params.privateDataType]);

  const { isTimedOut, setTimer } = useSimpleTimer();

  const privateData = route.params.privateData;
  const privateDataType = route.params.privateDataType;

  const words = privateData.split(" ");

  return (
    <PageWithScrollViewInBottomTabView
      style={style.flatten(["padding-x-page"])}
    >
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
