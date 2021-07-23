import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { useStyle } from "../../../styles";
import { View } from "react-native";
import { Button } from "../../../components/staging/button";
import { useSmartNavigation } from "../../../navigation";
import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";

export const RegisterIntroScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = useRegisterConfig(keyRingStore, []);

  return (
    <PageWithScrollView contentContainerStyle={style.get("flex-grow-1")}>
      <View style={style.flatten(["flex-1"])} />
      {/* TODO: Add the logo here */}
      <View style={style.flatten(["flex-1"])} />
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Scan extension QRcode"
        size="large"
        mode="light"
      />
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Import existing account"
        size="large"
        mode="light"
      />
      <Button
        containerStyle={style.flatten(["margin-bottom-16"])}
        text="Create New Account"
        size="large"
        onPress={() => {
          smartNavigation.navigateSmart("Register.NewMnemonic", {
            registerConfig,
          });
        }}
      />
      <Button
        containerStyle={style.flatten(["margin-bottom-64"])}
        text="Import Ledger"
        size="large"
        mode="text"
      />
    </PageWithScrollView>
  );
});
