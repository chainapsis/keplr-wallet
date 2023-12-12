import React, {FunctionComponent} from 'react';
import {GuideBoxProps} from './types';
import {Column, Columns} from '../column';
import {Box} from '../box';
import {InformationIcon} from '../icon/information';
import {useStyle} from '../../styles';
import {Stack} from '../stack';
import {StyleSheet, Text} from 'react-native';

export const GuideBox: FunctionComponent<GuideBoxProps> = ({
  title,
  paragraph,
  color = 'default',
  titleRight,
  bottom,
  hideInformationIcon,
  titleStyle,
}) => {
  const style = useStyle();
  const paragraphColor = (() => {
    switch (color) {
      case 'warning':
        return style.get('color-yellow-500@70%').color;
      case 'danger':
        return style.get('color-red-300').color;
      default:
        return style.get('color-gray-300').color;
    }
  })();
  const titleColor = (() => {
    switch (color) {
      case 'warning':
        return style.get('color-yellow-400').color;
      case 'danger':
        return style.get('color-red-300').color;
      default:
        return style.get('color-gray-100').color;
    }
  })();
  const backgroundColor = (() => {
    switch (color) {
      case 'warning':
        return style.get('color-yellow-800').color;
      case 'danger':
        return style.get('color-red-800').color;
      default:
        return style.get('color-gray-600').color;
    }
  })();

  return (
    <Box borderRadius={8} padding={18} backgroundColor={backgroundColor}>
      <Stack gutter={8}>
        <Columns sum={1} alignY="center" gutter={6}>
          {!hideInformationIcon ? (
            <InformationIcon size={20} color={titleColor} />
          ) : null}
          <Column weight={1}>
            <Text
              style={StyleSheet.flatten([
                style.flatten(['subtitle4']),
                {color: titleColor},
                titleStyle,
              ])}>
              {title}
            </Text>
          </Column>
          {titleRight}
        </Columns>
        {paragraph ? (
          typeof paragraph === 'string' ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten(['body2']),
                {color: paragraphColor},
              ])}>
              {paragraph}
            </Text>
          ) : (
            paragraph
          )
        ) : null}
        {bottom ? <Box>{bottom}</Box> : null}
      </Stack>
    </Box>
  );
};
