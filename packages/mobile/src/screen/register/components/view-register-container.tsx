import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform, StyleSheet, Text} from 'react-native';
import Reanimated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Button} from '../../../components/button';

export const ViewRegisterContainer: FunctionComponent<
  PropsWithChildren<{
    // rn navigation에서 header가 있는 screen은 rn navigation에서 top safe area를 제공한다.
    // 그렇지 않은 경우는 이걸 true로 설정해서 이 컴포넌트에서 처리하게 한다.
    forceEnableTopSafeArea?: boolean;

    paragraph?: string;

    // safe area를 단순하게 다루기 위해서 DimensionValue를 쓰지않고 number를 쓴다.
    padding?: number;
    paddingX?: number;
    paddingY?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;

    bottomButton?: React.ComponentProps<typeof Button>;
  }>
> = ({
  children,
  forceEnableTopSafeArea,
  paragraph,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingLeft,
  paddingRight,
  paddingBottom,
  bottomButton,
}) => {
  const style = useStyle();

  const safeAreaInsets = useSafeAreaInsets();

  const keyboard = (() => {
    // ios에서만 keyboard height를 고려한다.
    // 안드로이드는 의외로 지혼자 keyboard 처리가 잘 된다...
    // 당연히 platform이 동적으로 바뀔 순 없으므로 linter를 무시한다.
    if (Platform.OS === 'ios') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useAnimatedKeyboard();
    } else {
      return {
        height: {
          value: 0,
        },
      };
    }
  })();

  const viewStyle = useAnimatedStyle(() => {
    return {
      position: 'relative',
      height: '100%',
      paddingBottom: keyboard.height.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: '100%',
      padding,
      paddingTop:
        (paddingTop || paddingY || 0) +
        (forceEnableTopSafeArea ? safeAreaInsets.top : 0),
      paddingBottom:
        (paddingBottom || paddingY || 0) +
        (safeAreaInsets.bottom -
          Math.min(safeAreaInsets.bottom, keyboard.height.value)),
      paddingLeft: paddingLeft || paddingX,
      paddingRight: paddingRight || paddingX,
    };
  });

  const bottomMockViewStyle = useAnimatedStyle(() => {
    return {
      // TODO: 지금 button의 size를 button prop으로부터 고정적으로 가져올 수 없다.
      //       일단 현재 디자인 상 버튼 크기는 다 정해져 있으니 대충 72로 고정한다.
      // 40은 아래 위 패딩 20씩임
      height: bottomButton
        ? 72 + (40 - Math.min(40, keyboard.height.value))
        : 0,
    };
  });

  const bottomButtonViewStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      padding: 20,
      paddingBottom:
        20 + Math.max(safeAreaInsets.bottom, keyboard.height.value),
      bottom: 0,
      left: 0,
      right: 0,
    };
  });

  return (
    // 귀찮아서 ScrollViewRegisterContainer에서 복사해서 온거라서 Root가 다른 View로 시작함.
    <Reanimated.View style={viewStyle}>
      <Reanimated.View style={containerStyle}>
        {paragraph ? (
          <Text
            style={StyleSheet.flatten([
              style.flatten(['body2', 'text-center', 'color-text-low']),
              {marginTop: -3},
            ])}>
            {paragraph}
          </Text>
        ) : null}
        {children}
        <Reanimated.View style={bottomMockViewStyle} />
      </Reanimated.View>
      {bottomButton ? (
        <Reanimated.View style={bottomButtonViewStyle}>
          {<Button {...bottomButton} />}
        </Reanimated.View>
      ) : null}
    </Reanimated.View>
  );
};
