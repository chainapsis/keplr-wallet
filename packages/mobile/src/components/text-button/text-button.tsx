import React, {
  FunctionComponent,
  ReactElement,
  isValidElement,
  useState,
} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, Pressable, ViewStyle} from 'react-native';
import {Box} from '../box';

type ButtonColorType = 'faint' | 'default';
export type ButtonSize = 'small' | 'large';

export const TextButton: FunctionComponent<{
  color?: ButtonColorType;
  size?: ButtonSize;
  text: string;
  rightIcon?: ReactElement | ((color: string) => ReactElement);
  disabled?: boolean;
  onPress?: () => void;
  textStyle?: TextStyle;
  textColor?: keyof typeof ColorPalette;
  pressingColor?: keyof typeof ColorPalette;
  textButtonSize?: number;
  containerStyle?: ViewStyle;
}> = ({
  color = 'default',
  size,
  text,
  rightIcon,
  disabled = false,
  onPress,
  textStyle,
  containerStyle,
  textColor,
  pressingColor,
}) => {
  const style = useStyle();
  const [isPressIn, setIsPressIn] = useState(false);

  const textColorDefinition: string = (() => {
    if (textColor) {
      return `color-${textColor}`;
    }
    switch (color) {
      case 'faint':
        if (disabled) {
          return 'color-gray-300';
        }
        return 'color-gray-200';
      default:
        if (disabled) {
          return 'color-gray-300';
        }
        return 'color-white';
    }
  })();

  const pressingColorDefinition: string = (() => {
    if (pressingColor) {
      return `color-${pressingColor}`;
    }
    return 'color-gray-300';
  })();

  return (
    <Pressable
      disabled={disabled}
      style={StyleSheet.flatten([
        style.flatten([
          'flex-row',
          'justify-center',
          'items-center',
          'padding-x-8',
          isPressIn ? 'color-gray-300' : (textColorDefinition as any),
        ]),
        containerStyle,
      ])}
      onPress={onPress}
      onPressOut={() => setIsPressIn(false)}
      onPressIn={() => setIsPressIn(true)}>
      <Text
        style={StyleSheet.flatten([
          style.flatten([
            'text-center',
            size === 'large' ? 'text-button1' : 'text-button2',
            isPressIn
              ? (pressingColorDefinition as any)
              : (textColorDefinition as any),
          ]),
          textStyle,
        ])}>
        {text}
      </Text>
      <Box height={1} marginLeft={4} alignY="center">
        {isValidElement(rightIcon) ||
        !rightIcon ||
        !(typeof rightIcon === 'function')
          ? rightIcon
          : rightIcon(
              isPressIn
                ? style.get(pressingColorDefinition as any).color
                : style.get(textColorDefinition as any).color,
            )}
      </Box>
    </Pressable>
  );
};
