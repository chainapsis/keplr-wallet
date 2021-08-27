import React, { FunctionComponent } from "react";
import Icon from "react-native-vector-icons/Feather";
import { PageWithScrollView } from "../../components/staging/page";
import { useStyle } from "../../styles";
import { View, Text, Image, Linking } from "react-native";
import { Button } from "../../components/staging/button";
import { useSmartNavigation } from "../../navigation";

export const ResultScreen: FunctionComponent = () => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView
      contentContainerStyle={style.flatten(["flex-grow-1"])}
      style={style.flatten(["padding-x-42", "padding-bottom-12"])}
    >
      <View style={style.flatten(["flex", "items-center"])}>
        <Image
          style={{
            width: 122,
            height: 122,
            marginTop: 154,
            marginBottom: 87,
          }}
          source={require("../../assets/svg/success.png")}
        />

        <Text style={style.flatten(["h2", "margin-bottom-32"])}>Success</Text>
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
