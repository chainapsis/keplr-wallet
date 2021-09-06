import React, { FunctionComponent } from "react";
import { useHeaderHeight } from "@react-navigation/stack";
import { PageWithScrollView } from "../../components/page";
import { KeplrLogo } from "../../components/svg";
import { GoogleIcon } from "../../components/icon/google";
import { useStyle } from "../../styles";
import { View, Text, Dimensions, Platform } from "react-native";
import { Button } from "../../components/button";
import { useSmartNavigation } from "../../navigation";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

export const RegisterNotNewUserScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const headerHeight = useHeaderHeight();

  return (
    <PageWithScrollView
      contentContainerStyle={style.get("flex-grow-1")}
      style={{
        ...style.flatten(["padding-x-42"]),
        paddingTop:
          Dimensions.get("window").height * 0.22 -
          (Platform.OS === "android" ? headerHeight : 44),
        paddingBottom: Dimensions.get("window").height * 0.11,
      }}
    >
      <View
        style={style.flatten(["flex-grow-1", "items-center", "padding-x-18"])}
      >
        <KeplrLogo width="100%" />
      </View>

      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Sign in with Google"
        leftIcon={
          <View style={style.flatten(["margin-right-6"])}>
            <GoogleIcon />
          </View>
        }
        size="large"
        mode="light"
        onPress={() => {
          smartNavigation.navigateSmart("Register.TorusSignIn", {
            registerConfig,
          });
        }}
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
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Import from Keplr Extension"
        size="large"
        mode="light"
      />
      <Button
        text="Import existing wallet"
        size="large"
        mode="light"
        onPress={() => {
          smartNavigation.navigateSmart("Register.RecoverMnemonic", {
            registerConfig,
          });
        }}
      />
    </PageWithScrollView>
  );
});
