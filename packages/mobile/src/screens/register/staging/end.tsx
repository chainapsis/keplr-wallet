import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { useStyle } from "../../../styles";
import { View } from "react-native";
import { Button } from "../../../components/staging/button";
import { useSmartNavigation } from "../../../navigation";

export const RegisterEndScreen: FunctionComponent = () => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView contentContainerStyle={style.get("flex-grow-1")}>
      <View style={style.flatten(["flex-1"])} />
      <Button
        size="large"
        text="Done"
        onPress={() => {
          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "MainTabDrawer",
              },
            ],
          });
        }}
      />
    </PageWithScrollView>
  );
};
