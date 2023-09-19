import React, {FunctionComponent, ReactElement, isValidElement} from 'react';
import {useStyle} from '../../styles';
import {Text, StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {RectButton} from '../rect-button';

export const IconButton: FunctionComponent<{
  text?: string;
  icon: ReactElement | ((color: string) => ReactElement);
  path?: 'left' | 'right';
  disabled?: boolean;
  onPress?: () => void;
  hasBackgroundColor?: boolean;
  hasRipple?: boolean;

  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  style?: ViewStyle;

  rippleColor?: string;
  underlayColor?: string;
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
  hasRipple,
  rippleColor: propRippleColor,
  underlayColor: propUnderlayColor,
}) => {
  const style = useStyle();

  const rippleColor = (() => {
    if (!hasRipple) {
      return undefined;
    }
    if (propRippleColor) {
      return propRippleColor;
    }
    return style.get('color-gray-500').color;
  })();

  const underlayColor = (() => {
    if (!hasRipple) {
      return undefined;
    }
    if (propUnderlayColor) {
      return propUnderlayColor;
    }
    return style.get('color-gray-500').color;
  })();

  const backgroundColor = 'background-color-gray-600';
  const defaultTextColor = 'color-gray-300';

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(
          ['height-button-extra-small', 'border-radius-8', 'color-white'],
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
          ]),
          buttonStyle,
        ])}
        onPress={onPress}
        enabled={!disabled}
        rippleColor={rippleColor}
        underlayColor={underlayColor}
        activeOpacity={0.3}
        disableRippleAndUnderlay={!hasRipple}>
        {path === 'left' ? (
          <View style={style.flatten(['justify-center', 'margin-right-4'])}>
            <View>
              {isValidElement(icon) || !icon || !(typeof icon === 'function')
                ? icon
                : icon(style.get(defaultTextColor).color)}
            </View>
          </View>
        ) : null}
        <Text
          style={StyleSheet.flatten([
            style.flatten(['text-center', 'text-button2', defaultTextColor]),
            textStyle,
          ])}>
          {text}
        </Text>
        {path === 'right' ? (
          <View
            style={StyleSheet.flatten([
              style.flatten(['justify-center', 'margin-left-4']),
            ])}>
            {isValidElement(icon) || !icon || !(typeof icon === 'function')
              ? icon
              : icon(style.get(defaultTextColor).color)}
          </View>
        ) : null}
      </RectButton>
    </View>
  );
};
