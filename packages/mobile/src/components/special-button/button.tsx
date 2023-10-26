import React, {FunctionComponent, useState} from 'react';
import {SpecialButtonProps} from './types';
import {Box} from '../box';
import {ColorPalette, useStyle} from '../../styles';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {SVGLoadingIcon} from '../spinner';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const gradient1DefaultColor = ColorPalette['blue-400'];
const gradient1HoverColor = '#2C4BE2';
const gradient2DefaultColor = ColorPalette['blue-400'];
const gradient2HoverColor = '#7A59FF';
const hoverScale = 1.03;

export const SpecialButton: FunctionComponent<SpecialButtonProps> = ({
  size = 'small',
  onPress,
  left,
  text,
  right,
  isLoading,
  disabled,
  textOverrideIcon,
  width,
}) => {
  const style = useStyle();
  const height = style.get(`height-button-${size}`).height as number;
  const widthSize = useSharedValue(width);
  const heightSize = useSharedValue(height);
  const colorsValue = useSharedValue(0);

  const [colors, setColors] = useState<string[]>([
    interpolateColor(
      colorsValue.value,
      [0, 1],
      [gradient1DefaultColor, gradient2DefaultColor],
    ),
    interpolateColor(
      colorsValue.value,
      [0, 1],
      [gradient1HoverColor, gradient2HoverColor],
    ),
  ]);

  const textSizeDefinition = (() => {
    switch (size) {
      case 'large':
        return 'text-button1';
      //사이즈가 large 아닌경우 다 text-button2 적용됨
      default:
        return 'text-button2';
    }
  })();

  const animatedProps = useAnimatedProps(() => {
    if (Platform.OS === 'android') {
      return {colors: []};
    }

    return {
      colors: [
        interpolateColor(
          colorsValue.value,
          [0, 1],
          [gradient1DefaultColor, gradient2DefaultColor],
        ),
        interpolateColor(
          colorsValue.value,
          [0, 1],
          [gradient1HoverColor, gradient2HoverColor],
        ),
      ],
    };
  });

  return (
    <Box
      borderRadius={8}
      alignY="center"
      style={StyleSheet.flatten([
        style.flatten([`height-button-${size}` as any, 'overflow-hidden']),
      ])}>
      <Pressable
        style={StyleSheet.flatten([
          style.flatten([
            `height-button-${size}` as any,
            'flex-row',
            'justify-center',
            'items-center',
          ]),
        ])}
        disabled={disabled}
        onPress={() => {
          if (disabled || isLoading) {
            return;
          }

          if (onPress) {
            onPress();
          }
        }}
        onPressIn={() => {
          if (isLoading) {
            return;
          }
          widthSize.value = withSpring(width * hoverScale);
          heightSize.value = withSpring(height * hoverScale);
          //NOTE android에서는 애니메이션을 걸었을때 내부버그가 생겨서 일단 에니메이션 없이 색상만 변경 하게 수정함
          if (Platform.OS === 'android') {
            runOnJS(setColors)([gradient1HoverColor, gradient2HoverColor]);
          } else {
            colorsValue.value = withTiming(1, {duration: 100});
          }
        }}
        onPressOut={() => {
          widthSize.value = withSpring(width);
          heightSize.value = withSpring(height);
          if (Platform.OS === 'android') {
            runOnJS(setColors)([gradient1DefaultColor, gradient2DefaultColor]);
          } else {
            colorsValue.value = withTiming(0, {duration: 100});
          }
        }}>
        {/* NOTE 공식문서상 호환되는 타입인데 계속 에러가 떠서 일단 any를 사용함 */}

        <AnimatedLinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0.84, y: 0}}
          style={StyleSheet.flatten([
            style.flatten(['padding-x-8']),
            {
              width: widthSize as any,
              height: heightSize as any,
            },
          ])}
          animatedProps={animatedProps}
          colors={colors}>
          <Box alignY="center" height={'100%'}>
            {left ? (
              <Box
                marginRight={4}
                height={'100%'}
                alignX="center"
                alignY="center">
                {left}
              </Box>
            ) : null}
            {isLoading ? (
              <View
                style={style.flatten([
                  'absolute-fill',
                  'justify-center',
                  'items-center',
                ])}>
                <SVGLoadingIcon color={'white'} size={16} />
              </View>
            ) : null}
            {!isLoading && textOverrideIcon ? (
              <Box alignX="center" position="absolute">
                <Text>{textOverrideIcon}</Text>
              </Box>
            ) : null}
            <Text
              style={style.flatten(
                [textSizeDefinition, 'text-center', 'color-text-high'],
                [
                  isLoading && 'opacity-transparent',
                  !!textOverrideIcon && 'opacity-transparent',
                ],
              )}>
              {text || ''}
            </Text>
            {right ? (
              <Box
                marginLeft={4}
                height={'100%'}
                alignX="center"
                alignY="center">
                {right}
              </Box>
            ) : null}
          </Box>
        </AnimatedLinearGradient>
      </Pressable>
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
