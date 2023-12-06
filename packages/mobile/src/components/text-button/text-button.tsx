import React, {
  FunctionComponent,
  ReactElement,
  isValidElement,
  useState,
} from 'react';
import {useStyle} from '../../styles';
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
  //NOTE textStyle에서 색상을 변경하면 pressing 컬러가 먹히지 않기 떄문에 Omit으로 color만 제거함
  textStyle?: Omit<TextStyle, 'color'>;
  textColor?: string;
  pressingColor?: string;
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

  const textColorDefinition = (() => {
    if (textColor) {
      return textColor;
    }
    switch (color) {
      case 'faint':
        if (disabled) {
          return style.get('color-gray-300').color;
        }
        return style.get('color-gray-200').color;
      default:
        if (disabled) {
          return style.get('color-gray-300').color;
        }
        return style.get('color-white').color;
    }
  })();

  const pressingColorDefinition = (() => {
    if (pressingColor) {
      return pressingColor;
    }
    return style.get('color-gray-300').color;
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
          ]),
          {
            color: isPressIn ? pressingColorDefinition : textColorDefinition,
          },
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
              isPressIn ? pressingColorDefinition : textColorDefinition,
            )}
      </Box>
    </Pressable>
  );
};
