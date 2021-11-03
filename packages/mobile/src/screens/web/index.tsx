import React, { FunctionComponent } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { Button } from "../../components/button";
import { View } from "react-native";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const WebScreen: FunctionComponent = () => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const safeAreaInsets = useSafeAreaInsets();

  return (
    <PageWithScrollViewInBottomTabView
      contentContainerStyle={style.get("flex-grow-1")}
      style={{
        marginTop: safeAreaInsets.top,
      }}
    >
      <Button
        text="Test"
        onPress={() => {
          smartNavigation.pushSmart("Web.Osmosis", {});
        }}
      />
      <View style={style.get("flex-1")} />
      <Button text="Test" />
    </PageWithScrollViewInBottomTabView>
  );
};
