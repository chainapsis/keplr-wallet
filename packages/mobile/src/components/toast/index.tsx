import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Text } from "react-native-elements";
import {
  bcError,
  bcPrimary300,
  bcSecondary300,
  bcSuccess,
  bcWarining,
  bgcError,
  bgcPrimary300,
  bgcSecondary300,
  bgcSuccess,
  bgcWarining,
  body2,
  br1,
  bw1,
  fcError,
  fcPrimary300,
  fcSecondary300,
  fcSuccess,
  fcWarining,
  fcWhite,
  flexDirectionRow,
  p2,
  p4,
  sf,
  subtitle2,
} from "../../styles";

interface ToastProps {
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  icon?: any;
  title: string;
  content?: string[];
}

export const Toast: FunctionComponent<ToastProps> = ({
  color,
  icon,
  title,
  content,
}) => {
  const backgroundColor = (() => {
    switch (color) {
      case "primary":
        return bgcPrimary300;
      case "secondary":
        return bgcSecondary300;
      case "warning":
        return bgcWarining;
      case "error":
        return bgcError;
      case "success":
        return bgcSuccess;
      default:
        return bgcPrimary300;
    }
  })();

  return (
    <View style={sf([backgroundColor, br1, p4])}>
      <View style={flexDirectionRow}>
        {icon}
        <Text style={sf([fcWhite, subtitle2])}>{title}</Text>
      </View>
      {content?.map((contentText, index) => (
        <Text key={index} style={sf([fcWhite, body2])}>
          - {contentText}
        </Text>
      ))}
    </View>
  );
};

export const WhiteToast: FunctionComponent<ToastProps> = ({
  color,
  icon,
  title,
  content,
}) => {
  const [borderColor, fontColor] = (() => {
    switch (color) {
      case "primary":
        return [bcPrimary300, fcPrimary300];
      case "secondary":
        return [bcSecondary300, fcSecondary300];
      case "warning":
        return [bcWarining, fcWarining];
      case "error":
        return [bcError, fcError];
      case "success":
        return [bcSuccess, fcSuccess];
      default:
        return [bcPrimary300, fcPrimary300];
    }
  })();

  return (
    <View style={sf([borderColor, br1, bw1, p4])}>
      <View style={flexDirectionRow}>
        {icon}
        <Text style={sf([fontColor, subtitle2])}>{title}</Text>
      </View>
      {content?.map((contentText, index) => (
        <Text key={index} style={sf([fontColor, body2])}>
          - {contentText}
        </Text>
      ))}
    </View>
  );
};
