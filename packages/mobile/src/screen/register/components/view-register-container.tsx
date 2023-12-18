import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform, StyleSheet, Text} from 'react-native';
import Reanimated, {
  useAnimatedKeyboard,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Button} from '../../../components/button';
import {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

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

    contentContainerStyle?: ViewStyle;

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
  contentContainerStyle: propContentContainerStyle,
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
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: '100%',
    };
  });

  const contentContainerStyle = useAnimatedProps(() => {
    return {
      paddingTop:
        (paddingTop || paddingY || padding || 0) +
        (forceEnableTopSafeArea ? safeAreaInsets.top : 0),
      paddingBottom: paddingBottom || paddingY || padding,
      paddingLeft: paddingLeft || paddingX || padding,
      paddingRight: paddingRight || paddingX || padding,
      ...propContentContainerStyle,
    };
  });

  const bottomMockViewStyle = useAnimatedStyle(() => {
    return {
      // TODO: 지금 button의 size를 button prop으로부터 고정적으로 가져올 수 없다.
      //       일단 현재 디자인 상 버튼 크기는 다 정해져 있으니 대충 52로 고정한다.
      // 40은 아래 위 패딩 20씩임
      height: bottomButton
        ? 52 +
          40 +
          (safeAreaInsets.bottom -
            Math.min(safeAreaInsets.bottom, keyboard.height.value)) +
          keyboard.height.value
        : safeAreaInsets.bottom -
          Math.min(safeAreaInsets.bottom, keyboard.height.value) +
          keyboard.height.value,
    };
  });

  const bottomButtonViewStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      bottom: Math.max(safeAreaInsets.bottom, keyboard.height.value) + 20,
      left: 20,
      right: 20,
    };
  });

  return (
    // 귀찮아서 ScrollViewRegisterContainer에서 복사해서 온거라서 Root가 다른 View로 시작함.
    // 불필요한 구조인 것 같아도 ScrollViewRegisterContainer 보고 그냥 그러녀니하면 됨.
    <Reanimated.View style={viewStyle}>
      {paragraph ? (
        <Text
          style={StyleSheet.flatten([
            style.flatten(['body2', 'text-center', 'color-text-low']),
            {marginTop: -3, marginBottom: 3},
          ])}>
          {paragraph}
        </Text>
      ) : null}
      <Reanimated.View style={containerStyle}>
        {/* NOTE: reanimated로는 scroll view에서 contentContainerStyle를 못 쓴다... 따로 view를 내부에 분리시킴 */}
        <Reanimated.View style={contentContainerStyle}>
          {children}
          <Reanimated.View style={bottomMockViewStyle} />
        </Reanimated.View>
      </Reanimated.View>
      {bottomButton ? (
        <Reanimated.View style={bottomButtonViewStyle}>
          {<Button {...bottomButton} />}
        </Reanimated.View>
      ) : null}
    </Reanimated.View>
  );
};
