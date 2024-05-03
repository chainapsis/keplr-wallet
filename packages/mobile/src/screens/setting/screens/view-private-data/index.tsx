import React, { FunctionComponent, useEffect } from "react";
import { FlatList, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { CheckIcon } from "components/icon";
import { Button } from "components/button";
import * as Clipboard from "expo-clipboard";
import { PageWithScrollView } from "components/page";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSimpleTimer } from "hooks/use-simple-timer";
import { BlurBackground } from "components/new/blur-background/blur-background";

export const getPrivateDataTitle = (
  keyRingType: string,
  capitalize?: boolean
) => {
  if (capitalize) {
    return `${keyRingType === "mnemonic" ? "Mnemonic seed" : "Private key"}`;
  }

  return `${
    keyRingType === "mnemonic" ? "View mnemonic seed" : "View private key"
  }`;
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

  const renderButtonItem = ({ item }: any) => {
    return (
      <BlurBackground
        backgroundBlur={false}
        containerStyle={
          style.flatten([
            "padding-y-8",
            "margin-4",
            "flex-1",
            "items-center",
            "border-radius-64",
            "border-width-1",
            "border-color-white@40%",
          ]) as ViewStyle
        }
      >
        <Text style={style.flatten(["text-caption2", "color-white"])}>
          {item}
        </Text>
      </BlurBackground>
    );
  };

  return (
    <PageWithScrollView
      backgroundMode="image"
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
    >
      <BlurBackground
        borderRadius={12}
        blurIntensity={10}
        containerStyle={
          style.flatten([
            "margin-top-24",
            "padding-x-16",
            "padding-y-24",
          ]) as ViewStyle
        }
      >
        <View style={style.flatten(["flex-row", "flex-wrap"])}>
          {privateDataType === "mnemonic" ? (
            <FlatList
              data={words}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderButtonItem}
              numColumns={3}
              scrollEnabled={false}
            />
          ) : (
            <Text
              style={
                style.flatten([
                  "h6",
                  "margin-bottom-30",
                  "color-text-high",
                ]) as ViewStyle
              }
            >
              {words}
            </Text>
          )}
        </View>
        <View style={style.flatten(["width-full"]) as ViewStyle}>
          <Button
            mode="outline"
            containerStyle={
              style.flatten(
                ["border-radius-32", "margin-top-38", "border-color-white@40%"],
                [isTimedOut && "border-color-green-400"]
              ) as ViewStyle
            }
            textStyle={style.flatten(
              ["text-button1", "color-white"],
              [isTimedOut && "color-green-400"]
            )}
            {...(isTimedOut && {
              rightIcon: (
                <View style={style.flatten(["margin-left-8"]) as ViewStyle}>
                  <CheckIcon />
                </View>
              ),
            })}
            text="Copy to clipboard"
            onPress={async () => {
              await Clipboard.setStringAsync(words.join(" "));
              setTimer(3000);
            }}
          />
        </View>
      </BlurBackground>
    </PageWithScrollView>
  );
};
