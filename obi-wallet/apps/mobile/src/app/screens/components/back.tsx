import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import { TouchableHighlight, ViewStyle } from "react-native";

export interface BackProps {
  style?: ViewStyle;
}

export function Back({ style }: BackProps) {
  const { goBack } = useNavigation();
  return (
    <TouchableHighlight
      onPress={goBack}
      style={style}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#7B87A8" }} />
    </TouchableHighlight>
  );
}
