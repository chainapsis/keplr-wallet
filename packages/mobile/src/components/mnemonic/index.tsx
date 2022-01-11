import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";

export const WordChip: FunctionComponent<{
  index: number;
  word: string;

  hideWord?: boolean;

  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ index, word, hideWord, empty, dashedBorder }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten(
        [
          "padding-x-12",
          "padding-y-4",
          "border-radius-8",
          "background-color-white",
          "border-width-2",
          "border-color-primary",
          "margin-right-12",
          "margin-bottom-16",
        ],
        [empty && "border-color-primary-100", dashedBorder && "border-dashed"]
      )}
    >
      <Text
        style={style.flatten(
          ["subtitle2", "color-primary"],
          [empty && "color-primary-100", hideWord && "opacity-transparent"]
        )}
      >
        {empty ? `${index}.           ` : `${index}. ${word}`}
      </Text>
    </View>
  );
};
