import React, { FunctionComponent, useEffect } from "react";

import { Text, useTheme } from "react-native-elements";
import { RectButton } from "react-native-gesture-handler";
import { View } from "react-native";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export interface NotificationElementProps {
  type: "primary" | "success" | "warning" | "error" | "secondary";
  content: string;
  duration: number; // Seconds
}

export const NotificationElement: FunctionComponent<
  NotificationElementProps & {
    onDelete: () => void;
  }
> = ({ type, content, duration, onDelete }) => {
  const { theme } = useTheme();

  const width = 150;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDelete();
    }, duration * 1000);
    return () => clearTimeout(timer);
  }, [onDelete, duration]);

  return (
    <RectButton
      rippleColor="#AAAAAA"
      onPress={onDelete}
      style={{
        position: "absolute",
        bottom: 100,
        left: (Dimensions.get("window").width - width) / 2,
        width: width,
        opacity: 0.8,
        padding: 15,
        backgroundColor: theme.colors?.[type],
      }}
    >
      <View
        accessible
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>{content}</Text>
        <Icon size={24} name="x" color="#fff" />
      </View>
    </RectButton>
  );
};
