import {
  KeyboardAvoidingView as OriginalKeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
} from "react-native";

export function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
  return (
    <OriginalKeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      {...props}
    />
  );
}
