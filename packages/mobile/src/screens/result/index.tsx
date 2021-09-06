import React, { FunctionComponent } from "react";
import Icon from "react-native-vector-icons/Feather";
import { PageWithScrollView } from "../../components/page";
import { useStyle } from "../../styles";
import { View, Text, Linking } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import LottieView from "lottie-react-native";

export const ResultScreen: FunctionComponent = () => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView
      contentContainerStyle={style.flatten(["flex-grow-1", "justify-center"])}
      style={style.flatten(["padding-x-42", "padding-bottom-12"])}
    >
      <View style={style.flatten(["flex", "items-center"])}>
        <View
          style={style.flatten([
            "width-122",
            "height-122",
            "border-width-6",
            "border-color-primary",
            "border-radius-64",
            "margin-bottom-92",
          ])}
        >
          <View
            style={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 10,
              ...style.flatten(["absolute", "justify-center", "items-center"]),
            }}
          >
            <LottieView
              source={require("../../assets/lottie/pending.json")}
              colorFilters={[
                {
                  keypath: "#dot01",
                  color: style.get("color-primary").color,
                },
                {
                  keypath: "#dot02",
                  color: style.get("color-primary").color,
                },
                {
                  keypath: "#dot03",
                  color: style.get("color-primary").color,
                },
              ]}
              autoPlay
              loop
              style={style.flatten(["width-160"])}
            />
          </View>
        </View>

        <Text style={style.flatten(["h2", "margin-bottom-32", "text-center"])}>
          Pending
        </Text>
        <Text
          style={style.flatten(["body1", "text-center", "margin-bottom-64"])}
        >
          Congratulations!!
        </Text>
      </View>
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        size="large"
        text="Confirm"
        onPress={() => {
          smartNavigation.navigateSmart("Home", {});
        }}
      />
      <Button
        size="large"
        text="View on Mintscan"
        mode="text"
        rightIcon={
          <Icon
            style={style.flatten(["height-20", "margin-left-2"])}
            name="chevron-right"
            color={style.get("color-primary").color}
            size={20}
          />
        }
        onPress={() => {
          Linking.openURL("https://naver.com");
        }}
      />
    </PageWithScrollView>
  );
};
