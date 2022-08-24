import { TouchableOpacity } from "@gorhom/bottom-sheet/src";
import { BlurView } from "@react-native-community/blur";
import React from "react";
import { useWindowDimensions, StyleProp, ViewStyle } from "react-native";

interface BottomSheetBackdropProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  visible: boolean;
}

export function BottomSheetBackdrop({
  style,
  onPress,
  visible,
}: BottomSheetBackdropProps) {
  const dimensions = useWindowDimensions();
  if (visible === false) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        {
          flex: 1,
          position: "absolute",
          height: dimensions.height,
          width: dimensions.width,
          right: 0,
          left: 0,
        },
        style,
      ]}
      onPress={() => {
        onPress();
      }}
    >
      <BlurView style={{ flex: 1 }} blurAmount={0} />
    </TouchableOpacity>
  );
}
