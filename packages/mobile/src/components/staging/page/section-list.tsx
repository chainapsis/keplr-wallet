import React, { FunctionComponent } from "react";
import { SafeAreaView, SectionListProps, StyleSheet, View } from "react-native";
import { useStyle } from "../../../styles";
import { GradientBackground } from "../../svg";
import { KeyboardAwareSectionList } from "react-native-keyboard-aware-scroll-view";

export const PageWithSectionList: FunctionComponent<
  SectionListProps<any, any>
> = (props) => {
  const style = useStyle();

  const { style: propStyle, ...restProps } = props;

  return (
    <React.Fragment>
      <View style={style.get("absolute-fill")}>
        <GradientBackground />
      </View>
      <SafeAreaView style={style.get("flex-1")}>
        <KeyboardAwareSectionList
          style={StyleSheet.flatten([
            style.flatten([
              "flex-1",
              "padding-12",
              "padding-top-0",
              "overflow-visible",
            ]),
            propStyle,
          ])}
          keyboardOpeningTime={0}
          {...restProps}
        />
      </SafeAreaView>
    </React.Fragment>
  );
};
