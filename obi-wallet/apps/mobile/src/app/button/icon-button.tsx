import {
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedbackProps,
} from "react-native";

export type IconButtonProps = TouchableWithoutFeedbackProps;

export function IconButton(props: IconButtonProps) {
  if (Platform.OS === "ios") {
    return <TouchableOpacity {...props} />;
  } else {
    return <TouchableNativeFeedback {...props} />;
  }
}
