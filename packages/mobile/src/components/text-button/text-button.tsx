import React, {FunctionComponent, ReactElement, isValidElement} from 'react';
import {useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, View} from 'react-native';
import {RectButton} from '../rect-button';

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

  const textColorDefinition: string[] = (() => {
    switch (color) {
      case 'faint':
        if (disabled) {
          return ['color-gray-300'];
        }
        return ['color-gray-200'];
      default:
        if (disabled) {
          return ['color-gray-300'];
        }
        return ['color-white'];
    }
  })();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          'height-button-extra-small',
          'border-radius-8',
          'overflow-hidden',
          'relative',
          'text-button3',
          'color-white',
        ]),
      ])}>
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'flex-row',
            'justify-center',
            'items-center',
            'height-full',
            'padding-x-8',
          ]),
        ])}
        isTextMode={true}
        onPress={onPress}
        enabled={!disabled}>
        <Text
          style={StyleSheet.flatten([
            style.flatten([
              'text-center',
              'text-button2',
              ...(textColorDefinition as any),
            ]),
            textStyle,
          ])}>
          {text}
        </Text>
        <View
          style={style.flatten([
            'height-1',
            'justify-center',
            'margin-left-4',
          ])}>
          <View>
            {isValidElement(rightIcon) ||
            !rightIcon ||
            !(typeof rightIcon === 'function')
              ? rightIcon
              : rightIcon(
                  (style.flatten(textColorDefinition as any) as any).color,
                )}
          </View>
        </View>
      </RectButton>
    </View>
  );
};
