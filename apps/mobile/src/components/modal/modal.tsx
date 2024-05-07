import React from 'react';
import {useStyle} from '../../styles';

import {StyleSheet, Text, TextStyle, ViewStyle} from 'react-native';
import {Box} from '../box';

interface BaseModalHeaderProps {
  title: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;

  align?: 'left' | 'center';
}
export const BaseModalHeader = ({
  title,
  style: headerStyle,
  titleStyle,
  align = 'center',
}: BaseModalHeaderProps) => {
  const style = useStyle();

  return (
    <Box paddingY={8} paddingX={20} style={StyleSheet.flatten([headerStyle])}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(
            ['color-white', 'text-center', 'h4'],
            [align === 'left' && 'text-left'],
          ),
          titleStyle,
        ])}>
        {title}
      </Text>
    </Box>
  );
};
