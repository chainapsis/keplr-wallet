import React from 'react';
import {useStyle} from '../../styles';

import {StyleSheet, Text, TextStyle, ViewStyle} from 'react-native';
import {Box} from '../box';

interface BaseModalHeaderProps {
  title: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}
export const BaseModalHeader = ({
  title,
  style: headerStyle,
  titleStyle,
}: BaseModalHeaderProps) => {
  const style = useStyle();

  return (
    <Box paddingY={8} style={StyleSheet.flatten([headerStyle])}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['color-white', 'text-center', 'h4']),
          titleStyle,
        ])}>
        {title}
      </Text>
    </Box>
  );
};
