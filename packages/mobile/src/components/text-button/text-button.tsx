import React, {
  FunctionComponent,
  ReactElement,
  isValidElement,
  useState,
} from 'react';
import {useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, Pressable} from 'react-native';
import {Box} from '../box';

type ButtonColorType = 'faint' | 'default';

export const TextButton: FunctionComponent<{
  color?: ButtonColorType;
  text: string;
  rightIcon?: ReactElement | ((color: string) => ReactElement);
  disabled?: boolean;
  onPress?: () => void;
  textStyle?: TextStyle;
  textButtonSize?: number;
}> = ({
  color = 'default',
  text,
  rightIcon,
  disabled = false,
  onPress,
  textStyle,
}) => {
  const style = useStyle();
  const [isPressIn, setIsPressIn] = useState(false);

  const textColorDefinition: string = (() => {
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
      ])}
      onPress={onPress}
      onPressOut={() => setIsPressIn(false)}
      onPressIn={() => setIsPressIn(true)}>
      <Text
        style={StyleSheet.flatten([
          style.flatten([
            'text-center',
            'text-button2',
            isPressIn ? 'color-gray-300' : (textColorDefinition as any),
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
                ? style.get('color-gray-300').color
                : style.get(textColorDefinition as any).color,
            )}
      </Box>
    </Pressable>
  );
};
