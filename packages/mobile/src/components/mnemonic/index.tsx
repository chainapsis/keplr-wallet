import { BlurBackground } from "components/new/blur-background/blur-background";
import React, { FunctionComponent } from "react";
import { Text, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const WordChip: FunctionComponent<{
  word: string;

  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ word, empty, dashedBorder }) => {
  const style = useStyle();

  return (
    <BlurBackground
      blurIntensity={15}
      borderRadius={12}
      containerStyle={
        style.flatten(
          ["padding-y-12", "margin-4", "flex-1", "items-center"],
          dashedBorder ? ["border-color-indigo", "border-width-1"] : []
        ) as ViewStyle
      }
    >
      <Text style={style.flatten(["body3", "color-white"])}>
        {empty ? `` : `${word}`}
      </Text>
    </BlurBackground>
  );
};
