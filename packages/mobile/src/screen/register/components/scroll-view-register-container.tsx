import React, {FunctionComponent, PropsWithChildren} from 'react';
import {ContentHeightAwareScrollView} from '../../../components/scroll-view';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import {Platform, View, StyleSheet, Text} from 'react-native';
import Reanimated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {Button} from '../../../components/button';

const ReanimatedContentHeightAwareScrollView =
  Reanimated.createAnimatedComponent(ContentHeightAwareScrollView);

export const ScrollViewRegisterContainer: FunctionComponent<
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

    contentContainerStyle?: StyleProp<ViewStyle>;

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
  contentContainerStyle,
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
    // NOTE: 원래는 ReanimatedContentHeightAwareScrollView에 position: relative를 주고
    //       bottom button view에 position: absolute를 주고 bottom: 0을 주려고 했는데
    //       rn이 ㅂㅅ이라 scroll view에서 그렇게 하면 하위 자식의 absolute는 scroll view안의 content view 기준으로 붙기 때문에
    //       사실상 쓸모가 없다. 답이 없어져서 그냥 View를 상위에 하나 더 추가함
    <Reanimated.View style={viewStyle}>
      <ReanimatedContentHeightAwareScrollView
        style={(() => {
          return {
            height: '100%',
            padding,
            paddingTop:
              (paddingTop || paddingY || 0) +
              (forceEnableTopSafeArea ? safeAreaInsets.top : 0),
            paddingBottom:
              (paddingBottom || paddingY || 0) + safeAreaInsets.bottom,
            paddingLeft: paddingLeft || paddingX,
            paddingRight: paddingRight || paddingX,
          };
        })()}
        contentContainerStyle={contentContainerStyle}>
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
        <View
          style={{
            // TODO: 지금 button의 size를 button prop으로부터 고정적으로 가져올 수 없다.
            //       일단 현재 디자인 상 버튼 크기는 다 정해져 있으니 대충 72로 고정한다.
            height: bottomButton ? 72 + safeAreaInsets.bottom : 0,
          }}
        />
      </ReanimatedContentHeightAwareScrollView>
      {bottomButton ? (
        <Reanimated.View style={bottomButtonViewStyle}>
          {<Button {...bottomButton} />}
        </Reanimated.View>
      ) : null}
    </Reanimated.View>
  );
};
