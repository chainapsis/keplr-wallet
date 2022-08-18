import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableHighlight, ViewStyle } from "react-native";

export interface BackProps {
  style?: ViewStyle;
}

export function Back({ style }: BackProps) {
  const { goBack } = useNavigation();
  return (
    <TouchableHighlight onPress={goBack} style={style}>
      <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#7B87A8" }} />
    </TouchableHighlight>
  );
}
