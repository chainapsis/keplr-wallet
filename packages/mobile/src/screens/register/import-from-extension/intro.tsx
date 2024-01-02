import React, { FunctionComponent } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { PageWithView } from "../../../components/page";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ImportFromExtensionSvg from "../../../assets/svg/import-from-extension.svg";
import { useSmartNavigation } from "../../../navigation";

export const ImportFromExtensionIntroScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const smartNavigation = useSmartNavigation();

  const style = useStyle();

  return (
    <PageWithView backgroundMode="secondary">
      <View style={style.flatten(["padding-page", "flex-grow-1"]) as ViewStyle}>
        <View style={style.get("flex-2")} />
        <View style={style.flatten(["items-center"])}>
          <View style={style.flatten(["padding-left-10"]) as ViewStyle}>
            <ImportFromExtensionSvg />
          </View>
          <Text
            style={
              style.flatten([
                "h3",
                "color-text-high",
                "margin-top-68",
                "margin-bottom-46",
              ]) as ViewStyle
            }
          >
            Import from Fetch Extension
          </Text>
          <Text
            style={
              style.flatten([
                "body1",
                "color-text-low",
                "text-center",
                "margin-x-18",
                "margin-bottom-24",
              ]) as ViewStyle
            }
          >
            {`Import your account(s) by going to\n‘Settings > Link Fetch Mobile’ on Fetch Extension and scanning the QR code`}
          </Text>
          <Text
            style={
              style.flatten([
                "body3",
                "color-text-low",
                "text-center",
                "margin-x-38",
              ]) as ViewStyle
            }
          >
            Note: Ledger accounts need to be imported separately
          </Text>
        </View>
        <View style={style.get("flex-3")} />
        <Button
          text="Next"
          size="large"
          onPress={() => {
            smartNavigation.navigateSmart("Register.ImportFromExtension", {
              registerConfig: route.params.registerConfig,
            });
          }}
        />
      </View>
    </PageWithView>
  );
};
