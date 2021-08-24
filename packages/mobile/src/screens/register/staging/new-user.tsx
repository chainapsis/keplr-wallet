import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { useStyle } from "../../../styles";
import { View, Text, Image } from "react-native";
import { Button } from "../../../components/staging/button";
import { useSmartNavigation } from "../../../navigation";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const RegisterNewUserScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-42"])}
    >
      <View style={style.flatten(["flex", "items-center"])}>
        <Image
          style={style.flatten([
            "width-292",
            "height-90",
            "margin-top-106",
            "margin-bottom-288",
          ])}
          source={require("../../../assets/logo/keplr-logo-default.png")}
        />
      </View>

      <Button
        containerStyle={style.flatten(["margin-bottom-20"])}
        text="Sign In With Google"
        icon={
          <Image
            style={style.flatten(["width-20", "height-20", "margin-right-10"])}
            source={require("../../../assets/svg/icons8-google.png")}
          />
        }
        size="large"
        mode="light"
      />
      <Text
        style={style.flatten([
          "margin-bottom-20",
          "text-center",
          "color-text-black-low",
        ])}
      >
        Powered by Torus
      </Text>
      <Button
        text="Create New Seed"
        size="large"
        mode="light"
        onPress={() => {
          smartNavigation.navigateSmart("Register.NewMnemonic", {
            registerConfig,
          });
        }}
      />

      <View style={style.flatten(["flex-1"])} />
    </PageWithScrollView>
  );
});
