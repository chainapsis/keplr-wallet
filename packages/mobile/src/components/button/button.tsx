import React, {FunctionComponent, ReactElement, isValidElement} from 'react';
import {useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RectButton} from '../rect-button';
import {SVGLoadingIcon} from '../spinner';
import {Box} from '../box';

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
  color,
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
  const baseColor = ((color?: ButtonColorType) => {
    switch (color) {
      case 'danger':
        return 'red';
      case 'secondary':
        return 'gray';
      //default는 기본적으로 primary 색상으로 적용
      default:
        return 'blue';
    }
  })(color);

  const backgroundColorDefinitions: string[] = (() => {
    switch (color) {
      case 'danger':
        return [`background-color-${baseColor}-300@30%`];
      case 'secondary':
        return [`background-color-${baseColor}-400`];
      //default는 기본적으로 primary 색상으로 적용
      default:
        return [
          `background-color-${baseColor}-400`,
          `light:background-color-${baseColor}-50`,
        ];
    }
  })();
  const textDefinition = (() => {
    switch (size) {
      case 'large':
        return 'text-button1';
      //사이즈가 large 아닌경우 다 text-button2 적용됨
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
      //default는 기본적으로 primary 색상으로 적용 primary랑 secondary는 같은 색이라서 해당 색으로 적용
      default:
        return ['color-white'];
    }
  })();

  const iconColorDefinition = (() => {
    switch (color) {
      case 'danger':
        return 'color-red-400';
      case 'secondary':
        return 'color-gray-200';
      //default는 기본적으로 primary 색상으로 적용
      default:
        return 'color-blue-200';
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
    <Box
      borderRadius={8}
      position="relative"
      onClick={onPress}
      style={StyleSheet.flatten([
        style.flatten([
          ...(backgroundColorDefinitions as any),
          `height-button-${size}` as any,
          'overflow-hidden',
        ]),
        containerStyle,
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
          buttonStyle,
        ])}
        enabled={!loading && !disabled}
        rippleColor={rippleColor}
        underlayColor={underlayColor}
        activeOpacity={propUnderlayColor ? 1 : color === 'primary' ? 0.3 : 0.2}>
        <Box
          height={1}
          marginRight={4}
          alignY="center"
          style={style.flatten([], [loading && 'opacity-transparent'])}>
          <Box>
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
          </Box>
        </Box>
        <Text
          style={StyleSheet.flatten([
            style.flatten(
              [textDefinition, 'text-center', ...(textColorDefinition as any)],
              [loading && 'opacity-transparent'],
            ),
            textStyle,
          ])}>
          {text}
        </Text>
        <Box
          height={1}
          marginLeft={4}
          alignY="center"
          style={style.flatten([], [loading && 'opacity-transparent'])}>
          <Box>
            {isValidElement(rightIcon) ||
            !rightIcon ||
            !(typeof rightIcon === 'function')
              ? rightIcon
              : rightIcon(
                  (style.flatten(textColorDefinition as any) as any).color,
                )}
          </Box>
        </Box>
        {loading ? (
          <View
            style={style.flatten([
              'absolute-fill',
              'justify-center',
              'items-center',
            ])}>
            <SVGLoadingIcon
              color={style.get(iconColorDefinition).color}
              size={16}
            />
          </View>
        ) : null}
      </RectButton>
      <View
        pointerEvents="none"
        style={style.flatten(
          ['absolute-fill'],
          [disabled && 'background-color-gray-600@50%'],
        )}
      />
    </Box>
  );
};
