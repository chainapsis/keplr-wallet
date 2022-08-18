import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableHighlight, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Back(props) {
  const { goBack } = useNavigation();
  return (
    <TouchableHighlight onPress={goBack} style={props?.style as ViewStyle}>
      <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#7B87A8" }} />
    </TouchableHighlight>
  );
}
