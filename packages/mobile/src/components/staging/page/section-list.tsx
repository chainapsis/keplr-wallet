import React, { FunctionComponent } from "react";
import {
  SafeAreaView,
  SectionList,
  SectionListProps,
  StyleSheet,
  View,
} from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";

export const PageWithSectionList: FunctionComponent<
  SectionListProps<any, any>
> = (prop) => {
  const style = useStyle();

  const propStyle = prop.style;
  delete prop.style;

  return (
    <React.Fragment>
      <View style={style.get("absolute-fill")}>
        <GradientBackground />
      </View>
      <SafeAreaView style={style.get("flex-1")}>
        <SectionList
          style={StyleSheet.flatten([
            style.flatten(["absolute-fill", "padding-12", "padding-top-0"]),
            propStyle,
          ])}
          {...prop}
        />
      </SafeAreaView>
    </React.Fragment>
  );
};
