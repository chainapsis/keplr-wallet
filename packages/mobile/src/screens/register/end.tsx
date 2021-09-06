import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../components/staging/page";
import { useStyle } from "../../styles";
import { View, Text, Image } from "react-native";
import { Button } from "../../components/staging/button";
import { useSmartNavigation } from "../../navigation";

export const RegisterEndScreen: FunctionComponent = () => {
  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView
      contentContainerStyle={style.flatten(["flex-grow-1"])}
      style={style.flatten(["padding-x-page", "padding-bottom-12"])}
    >
      <View style={style.flatten(["flex", "items-center"])}>
        <Image
          style={{
            width: 214,
            height: 214,
            marginTop: 108,
            marginBottom: 34,
          }}
          source={require("../../assets/svg/icons8-person.png")}
        />

        <Text style={style.flatten(["h1", "margin-bottom-16"])}>
          You’re all set !
        </Text>
        <Text style={style.flatten(["subtitle1", "text-center"])}>
          Open the extension and sign in to begin your interchain journey
        </Text>
      </View>
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
