import React, {FunctionComponent, ReactElement, isValidElement} from 'react';
import {useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {RectButton} from '../rect-button';
import {Box} from '../box';

export const IconButton: FunctionComponent<{
  text?: string;
  icon: ReactElement | ((color: string) => ReactElement);
  path?: 'left' | 'right';
  disabled?: boolean;
  onPress?: () => void;
  hasBackgroundColor?: boolean;

  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  style?: ViewStyle;

  rippleColor?: string;
  underlayColor?: string;
  activeOpacity?: number;
}> = ({
  text,
  icon,
  disabled = false,
  path = 'right',
  onPress,
  textStyle,
  style: buttonStyle,
  containerStyle,
  hasBackgroundColor,
  rippleColor: propRippleColor,
  underlayColor: propUnderlayColor,
  activeOpacity = 0.3,
}) => {
  const style = useStyle();

  const rippleColor = (() => {
    if (propRippleColor) {
      return propRippleColor;
    }
    return style.get('color-gray-550').color;
  })();

  const underlayColor = (() => {
    if (propUnderlayColor) {
      return propUnderlayColor;
    }
    return style.get('color-gray-550').color;
  })();

  const backgroundColor = 'background-color-gray-600';
  const defaultTextColor = 'color-gray-300';

  return (
    <Box
      borderRadius={8}
      style={StyleSheet.flatten([
        style.flatten(
          ['height-button-extra-small', 'color-white'],
          [hasBackgroundColor && backgroundColor],
        ),
        containerStyle,
      ])}>
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'flex-row',
            'justify-center',
            'items-center',
            'height-full',
            'border-radius-32',
            'padding-6',
          ]),
          buttonStyle,
        ])}
        onPress={onPress}
        enabled={!disabled}
        rippleColor={rippleColor}
        underlayColor={underlayColor}
        activeOpacity={activeOpacity}>
        {path === 'left' ? (
          <Box marginRight={4} alignY="center">
            <Box>
              {isValidElement(icon) || !icon || !(typeof icon === 'function')
                ? icon
                : icon(style.get(defaultTextColor).color)}
            </Box>
          </Box>
        ) : null}
        <Text
          style={StyleSheet.flatten([
            style.flatten(['text-center', 'text-button2', defaultTextColor]),
            textStyle,
          ])}>
          {text}
        </Text>
        {path === 'right' ? (
          <Box alignX="center" alignY="center">
            {isValidElement(icon) || !icon || !(typeof icon === 'function')
              ? icon
              : icon(style.get(defaultTextColor).color)}
          </Box>
        ) : null}
      </RectButton>
    </Box>
  );
};
