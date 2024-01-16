import React, {FunctionComponent, PropsWithChildren, useEffect} from 'react';
import {ContentHeightAwareScrollView} from '../../../components/scroll-view';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  findNodeHandle,
  UIManager,
} from 'react-native';
import Reanimated, {
  useAnimatedKeyboard,
  useAnimatedProps,
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

    contentContainerStyle?: ViewStyle;

    bottomButton?: React.ComponentProps<typeof Button>;
    bottomButtonStyle?: ViewStyle;
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
  bottomButtonStyle,
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
      ...bottomButtonStyle,
    };
  });

  const scrollViewRef = React.useRef<ScrollView>(null);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const listener = Keyboard.addListener('keyboardDidShow', frames => {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        const currentlyFocusedInput =
          NativeTextInput.State.currentlyFocusedInput();
        if (currentlyFocusedInput && scrollViewRef.current) {
          // viewIsDescendantOf 이거 존재는 하는데 공식적인(?) 지원이 아니라 타이핑에는 없다고 함...
          // 일단 방법이 없으니 이걸 쓴다...
          // @ts-ignore
          UIManager.viewIsDescendantOf(
            findNodeHandle(currentlyFocusedInput),
            scrollViewRef.current.getInnerViewNode(),
            (isAncestor: boolean) => {
              if (isAncestor) {
                currentlyFocusedInput.measureInWindow((_1, y, _3, height) => {
                  const textInputBottomPosition = y + height;
                  const afterScreenY = frames.endCoordinates.screenY;
                  const extraBottomHeight = bottomButton ? 52 + 40 : 0;
                  // 안드로이드는 키보드 자체가 레이아웃을 바꾸기 때문에 키보드 높이를 고려할 필요가 없다.
                  const keyboardSize =
                    Platform.OS === 'ios' ? frames.endCoordinates.height : 0;

                  if (
                    textInputBottomPosition >
                    afterScreenY - extraBottomHeight
                  ) {
                    UIManager.measureInWindow(
                      scrollViewRef.current?.getScrollableNode(),
                      (_1, _2, _3, scrollViewHeight) => {
                        currentlyFocusedInput.measureLayout(
                          scrollViewRef.current?.getInnerViewNode(),
                          (_1, top, _3, height) => {
                            scrollViewRef.current?.scrollTo({
                              y:
                                top +
                                height +
                                extraBottomHeight +
                                keyboardSize -
                                scrollViewHeight,
                              animated: true,
                            });
                          },
                        );
                      },
                    );
                  }
                });
              }
            },
          );
        }
        // 나도 잘 모르겠음... 그냥 timeout을 주는게 그나마 좀 더 안정적임...
        // 안드로이드에서 layout이 바뀌고 그게 실제로 적용될때까지의 시간차가 있는 것 같음...
        // ios도 가끔씩 텍스트 인풋의 포커스에 의해서 스크롤 위치등이 바뀌는데 그때도 시간차가 있는듯...
      }, 50);
    });

    return () => {
      listener.remove();
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    };
  }, [bottomButton]);

  return (
    // NOTE: 원래는 ReanimatedContentHeightAwareScrollView에 position: relative를 주고
    //       bottom button view에 position: absolute를 주고 bottom: 0을 주려고 했는데
    //       rn이 ㅂㅅ이라 scroll view에서 그렇게 하면 하위 자식의 absolute는 scroll view안의 content view 기준으로 붙기 때문에
    //       사실상 쓸모가 없다. 답이 없어져서 그냥 View를 상위에 하나 더 추가함
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
      <ReanimatedContentHeightAwareScrollView
        ref={scrollViewRef}
        style={containerStyle}
        contentContainerStyle={{
          // NOTE: 일단 scroll view가 전체 화면을 다 채올때는 flex grow를 쓴다...
          //       근데 밑에 주석을 참고해보면 실제로는 reanimated 문제로 view를 내부에 분리했기 때문에
          //       여기서도 flew grow를 주지 않으면 생각대로 동작하지 않는다.
          flexGrow:
            propContentContainerStyle?.flexGrow != null
              ? propContentContainerStyle.flexGrow
              : undefined,
        }}
        indicatorStyle="white">
        {/* NOTE: reanimated로는 scroll view에서 contentContainerStyle를 못 쓴다... 따로 view를 내부에 분리시킴 */}
        <Reanimated.View style={contentContainerStyle as any}>
          {children}
          <Reanimated.View style={bottomMockViewStyle} />
        </Reanimated.View>
      </ReanimatedContentHeightAwareScrollView>
      {bottomButton ? (
        <Reanimated.View style={bottomButtonViewStyle}>
          {<Button {...bottomButton} />}
        </Reanimated.View>
      ) : null}
    </Reanimated.View>
  );
};
