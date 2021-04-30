import React, { FunctionComponent, useEffect } from "react";

import { Text, useTheme } from "react-native-elements";
import { RectButton } from "react-native-gesture-handler";
import { View } from "react-native";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import {
  alignItemsCenter,
  fcWhite,
  flexDirectionRow,
  justifyContentBetween,
  sf,
} from "../../styles";

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
        top: 40,
        left: 8,
        width: Dimensions.get("window").width - 16,
        marginRight: 8,
        padding: 15,
        backgroundColor: theme.colors?.[type],
        borderRadius: 6,
      }}
    >
      <View
        accessible
        style={sf([flexDirectionRow, justifyContentBetween, alignItemsCenter])}
      >
        <Text style={fcWhite}>{content}</Text>
        <Icon size={24} name="x" color="#fff" />
      </View>
    </RectButton>
  );
};
