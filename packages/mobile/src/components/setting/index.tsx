import React, { FunctionComponent } from "react";

import { View } from "react-native";
import {
  alignItemsCenter,
  bbw1,
  bcWhiteGrey,
  bgcWhite,
  body1,
  btw1,
  fcLow,
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
import { Address } from "../address";

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
          bcWhiteGrey,
          p4,
        ])}
      >
        <View style={sf([flex1, flexDirectionRow, alignItemsCenter])}>
          {leftIcon}
          <Text style={body1}>{label}</Text>
        </View>
        <View style={sf([flexDirectionRow, alignItemsCenter])}>
          <Text style={sf([body1, fcLow, mr2])}>{subText}</Text>
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
  return <Text style={sf([overline, fcLow, ml4, mt4])}>{title}</Text>;
};

export const AddressBook: FunctionComponent<{
  isTop?: boolean;
  rightIcon?: any;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  rightIconOnPress?: () => void;
  name: string;
  memo?: string;
  address: string;
}> = ({
  isTop = false,
  rightIcon,
  onPress,
  onEdit,
  onDelete,
  rightIconOnPress,
  name,
  memo,
  address,
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
          bcWhiteGrey,
          p4,
        ])}
      >
        <View style={sf([flex1])}>
          <View style={sf([flexDirectionRow, alignItemsCenter])}>
            <Text style={subtitle2}>{name}</Text>
            {memo ? <Text style={subtitle2}>{memo}</Text> : null}
          </View>
          <Address address={address} maxCharacters={22} />
        </View>

        {/* temporary delete address and edit address */}
        <View>
          {/* To Do => Edit Address */}
          {/* <RectButton onPress={onEdit}>
            <View accessible>
              <Text>Edit</Text>
            </View>
          </RectButton> */}
          <RectButton onPress={onDelete}>
            <View accessible>
              <Text>Delete</Text>
            </View>
          </RectButton>
        </View>
        <View style={sf([flexDirectionRow, alignItemsCenter])}>
          <RectButton onPress={rightIconOnPress ? rightIconOnPress : onPress}>
            <View accessible>{rightIcon}</View>
          </RectButton>
        </View>
      </View>
    </RectButton>
  );
};
