import React, {forwardRef} from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollViewProps,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import {useStyle} from '../../styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {BackgroundMode, ScreenBackground} from './background';
import {useSetFocusedScreen} from './utils';

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView,
);

export const PageWithScrollView = forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      disableSafeArea?: boolean;
      containerStyle?: ViewStyle;

      backgroundMode: BackgroundMode;
    }
  >
>((props, ref) => {
  useSetFocusedScreen();
  const style = useStyle();

  const {
    style: propStyle,
    fixed,
    disableSafeArea,
    containerStyle,
    backgroundMode,
    indicatorStyle,
    ...restProps
  } = props;

  const ContainerElement = disableSafeArea ? View : SafeAreaView;

  return (
    <React.Fragment>
      <ScreenBackground backgroundMode={backgroundMode} />
      <ContainerElement
        style={StyleSheet.flatten([
          style.flatten(
            ['flex-1'],
            /*
             In android, overflow of container view is hidden by default.
             That's why even if you make overflow visible to the scroll view's style, it will behave like hidden unless you change the overflow property of this container view.
             This is done by the following reasons.
                - On Android, header or bottom tabbars are opaque by default, so overflow hidden is usually not a problem.
                - Bug where overflow visible is ignored for unknown reason if ScrollView has RefreshControl .
                - If the overflow of the container view is not hidden, even if the overflow of the scroll view is hidden, there is a bug that the refresh control created from above still appears outside the scroll view.
             */
            [Platform.OS !== 'ios' && 'overflow-hidden'],
          ),
          containerStyle,
        ])}>
        <AnimatedKeyboardAwareScrollView
          innerRef={_ref => {
            if (ref) {
              // I don't know why the _ref's type is JSX.Element
              if (typeof ref === 'function') {
                ref(_ref as any);
              } else {
                ref.current = _ref as any;
              }
            }
          }}
          style={StyleSheet.flatten([
            style.flatten(
              ['flex-1', 'padding-0'],
              /*
               XXX: After react-native@0.64, this makes layout changes by unknown reason on android.
                    Unfortunately, the reason can't be found on changelog.
                    However, "overflow-visible" is necessary only in IOS to show the UI under top/bottom bar with blur.
               */
              [Platform.OS === 'ios' && 'overflow-visible'],
            ),
            propStyle,
          ])}
          keyboardOpeningTime={0}
          indicatorStyle={
            indicatorStyle ?? style.theme === 'light' ? 'black' : 'white'
          }
          {...restProps}
        />
        <View
          style={style.flatten(['absolute', 'width-full', 'height-full'])}
          pointerEvents="box-none">
          {fixed}
        </View>
      </ContainerElement>
    </React.Fragment>
  );
});
