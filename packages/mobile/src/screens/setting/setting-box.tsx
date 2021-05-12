import React, { FunctionComponent } from "react";

import { View } from "react-native";
import {
  alignItemsCenter,
  bbw1,
  bcGray,
  bgcWhite,
  body3,
  btw1,
  fcGrey2,
  flex1,
  flexDirectionRow,
  justifyContentBetween,
  ml4,
  mr2,
  mt4,
  overline,
  p4,
  sf,
  subtitle2,
} from "../../styles";
import { RectButton } from "react-native-gesture-handler";
import { Text } from "react-native-elements";

interface SettingBoxProps {
  isTop?: boolean;
  leftIcon?: any;
  rightIcon?: any;
  onPress?: () => void;
  rightIconOnPress?: () => void;
  label: string;
  subText?: string;
}

export const SettingBox: FunctionComponent<SettingBoxProps> = ({
  isTop = false,
  leftIcon,
  rightIcon,
  onPress,
  rightIconOnPress,
  label,
  subText,
}) => {
  return (
    <RectButton rippleColor="#AAAAAA" onPress={onPress}>
      <View
        accessible
        style={sf([
          flexDirectionRow,
          bgcWhite,
          justifyContentBetween,
          isTop ? btw1 : {},
          bbw1,
          bcGray,
          p4,
        ])}
      >
        <View style={sf([flex1, flexDirectionRow, alignItemsCenter])}>
          {leftIcon}
          <Text style={subtitle2}>{label}</Text>
        </View>
        <View style={sf([flexDirectionRow, alignItemsCenter])}>
          <Text style={sf([body3, fcGrey2, mr2])}>{subText}</Text>
          <RectButton onPress={rightIconOnPress ? rightIconOnPress : onPress}>
            <View accessible>{rightIcon}</View>
          </RectButton>
        </View>
      </View>
    </RectButton>
  );
};

export const SettingTitle: FunctionComponent<{ title: string }> = ({
  title,
}) => {
  return <Text style={sf([overline, fcGrey2, ml4, mt4])}>{title}</Text>;
};
