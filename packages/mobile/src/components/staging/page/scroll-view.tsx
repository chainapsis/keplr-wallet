import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";

export const PageWithScrollView: FunctionComponent = ({ children }) => {
  const style = useStyle();

  return (
    <React.Fragment>
      <View style={style.get("absolute-fill")}>
        <GradientBackground />
      </View>
      <SafeAreaView style={style.get("flex-1")}>
        <ScrollView
          style={style.flatten([
            "absolute-fill",
            "padding-12",
            "padding-top-0",
          ])}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </React.Fragment>
  );
};
