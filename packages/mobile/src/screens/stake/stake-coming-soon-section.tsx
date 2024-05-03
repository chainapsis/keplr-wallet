import React, { FunctionComponent, useRef } from "react";
import { ScrollView, Text, ViewStyle } from "react-native";
import { IconWithText } from "components/new/icon-with-text/icon-with-text";
import { useStyle } from "styles/index";
import { ColumnFrame } from "components/new/icon/column-frame";
import { PageWithScrollViewInBottomTabView } from "components/page";

export const StakeSection: FunctionComponent = () => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const style = useStyle();

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode={"image"}
      isTransparentHeader={true}
      contentContainerStyle={style.flatten(["flex-grow-1", "justify-center"])}
      style={style.flatten(["padding-x-page"]) as ViewStyle}
      ref={scrollViewRef}
    >
      <IconWithText
        title={"Stake"}
        subtitle={"This feature will be available\nin the next releases"}
        icon={<ColumnFrame />}
        isComingSoon={true}
        titleStyle={style.flatten(["h3", "font-normal"]) as ViewStyle}
      >
        <Text
          style={
            style.flatten([
              "body2",
              "color-gray-200",
              "padding-y-8",
              "text-center",
              "font-medium",
            ]) as ViewStyle
          }
        >
          {"You can use this feature in your\nbrowser extension."}
        </Text>
      </IconWithText>
    </PageWithScrollViewInBottomTabView>
  );
};
