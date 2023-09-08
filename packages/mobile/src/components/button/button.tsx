import React, {FunctionComponent, ReactElement, isValidElement} from 'react';
import {useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RectButton} from '../rect-button';
import {SVGLoadingIcon} from '../spinner';

type ButtonColorType = 'primary' | 'secondary' | 'danger';

export const Button: FunctionComponent<{
  color?: ButtonColorType;
  size?: 'extra-small' | 'small' | 'medium' | 'large';
  text: string;
  leftIcon?: ReactElement | ((color: string) => ReactElement);
  rightIcon?: ReactElement | ((color: string) => ReactElement);
  loading?: boolean;
  disabled?: boolean;

  onPress?: () => void;

  containerStyle?: ViewStyle;
  style?: ViewStyle;
  textStyle?: TextStyle;

  rippleColor?: string;
  underlayColor?: string;
}> = ({
  color = 'primary',
  size = 'medium',
  text,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  onPress,
  containerStyle,
  style: buttonStyle,
  textStyle,
  rippleColor: propRippleColor,
  underlayColor: propUnderlayColor,
}) => {
  const style = useStyle();
  const baseColor = ((color: ButtonColorType) => {
    switch (color) {
      case 'danger':
        return 'red';
      case 'primary':
        return 'blue';
      default:
        return 'gray';
    }
  })(color);

  const backgroundColorDefinitions: string[] = (() => {
    switch (color) {
      case 'danger':
        return [`background-color-${baseColor}-300@30%`];
      case 'primary':
        return [
          `background-color-${baseColor}-400`,
          `light:background-color-${baseColor}-50`,
        ];
      default:
        return [`background-color-${baseColor}-400`];
    }
  })();
  const textDefinition = (() => {
    switch (size) {
      case 'large':
        return 'text-button1';

      default:
        return 'text-button2';
    }
  })();

  const textColorDefinition: string[] = (() => {
    switch (color) {
      case 'danger':
        return ['color-red-400'];
      case 'primary':
        return ['color-white', 'light:color-blue-400'];
      default:
        return ['color-white'];
    }
  })();

  const rippleColor = (() => {
    if (propRippleColor) {
      return propRippleColor;
    }
    return style.get('color-gray-500').color;
  })();

  const underlayColor = (() => {
    if (propUnderlayColor) {
      return propUnderlayColor;
    }
    return style.get('color-gray-500').color;
  })();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          ...(backgroundColorDefinitions as any),
          `height-button-${size}` as any,
          'border-radius-8',
          'overflow-hidden',
          'relative',
        ]),
        containerStyle,
      ])}>
      <View
        style={
          disabled &&
          style.flatten(['background-color-gray-600@50%', 'absolute-fill'])
        }>
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              'flex-row',
              'justify-center',
              'items-center',
              'height-full',
              'padding-x-8',
            ]),
            buttonStyle,
          ])}
          onPress={onPress}
          enabled={!loading && !disabled}
          rippleColor={rippleColor}
          underlayColor={underlayColor}
          activeOpacity={
            propUnderlayColor ? 1 : color === 'primary' ? 0.3 : 0.2
          }>
          <View
            style={style.flatten(
              ['height-1', 'justify-center', 'margin-right-4'],
              [loading && 'opacity-transparent'],
            )}>
            <View>
              {typeof leftIcon === 'function' &&
                leftIcon(
                  (style.flatten(textColorDefinition as any) as any).color,
                )}
              {isValidElement(leftIcon) ||
              !leftIcon ||
              !(typeof leftIcon === 'function')
                ? leftIcon
                : leftIcon(
                    (style.flatten(textColorDefinition as any) as any).color,
                  )}
            </View>
          </View>
          <Text
            style={StyleSheet.flatten([
              style.flatten(
                [
                  textDefinition,
                  'text-center',
                  ...(textColorDefinition as any),
                ],
                [loading && 'opacity-transparent'],
              ),
              textStyle,
            ])}>
            {text}
          </Text>
          <View
            style={style.flatten(
              ['height-1', 'justify-center', 'margin-left-4'],
              [loading && 'opacity-transparent'],
            )}>
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
          {loading ? (
            <View
              style={style.flatten([
                'absolute-fill',
                'justify-center',
                'items-center',
              ])}>
              <SVGLoadingIcon color="white" size={16} />
            </View>
          ) : null}
        </RectButton>
      </View>
    </View>
  );
};
