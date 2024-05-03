import React, { forwardRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { HeaderBackButtonIcon } from "components/header/icon/back";
import { IconButton } from "components/new/button/icon";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import { useStyle } from "styles/index";
import {
  usePageRegisterScrollYValue,
  useSetFocusedScreen,
} from "components/page/utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundMode, ScreenBackground } from "components/page/background";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(
  KeyboardAwareScrollView
);

export const PageWithScrollViewHeader = forwardRef<
  ScrollView,
  React.PropsWithChildren<
    ScrollViewProps & {
      fixed?: React.ReactNode;
      disableSafeArea?: boolean;
      containerStyle?: ViewStyle;

      backgroundMode: BackgroundMode;
      backgroundBlur?: boolean;
      headerTitle: string;
      parallaxHeaderHeight?: number;
    }
  >
>((props, ref) => {
  const style = useStyle();

  const {
    style: propStyle,
    onScroll,
    fixed,
    containerStyle,
    backgroundMode,
    backgroundBlur,
    headerTitle,
    parallaxHeaderHeight = 130,
    ...restProps
  } = props;

  useSetFocusedScreen();
  const scrollY = usePageRegisterScrollYValue();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const safeAreaInsets = useSafeAreaInsets();
  const STICKY_HEADER_HEIGHT =
    Platform.OS === "ios" ? safeAreaInsets.top + 30 : 48 + 20;
  const ContainerElement = View;

  return (
    <React.Fragment>
      <ScreenBackground
        backgroundMode={backgroundMode}
        backgroundBlur={backgroundBlur}
      />
      <ContainerElement
        style={StyleSheet.flatten([
          style.flatten(
            ["flex-1"],
            /*
           In android, overflow of container view is hidden by default.
           That's why even if you make overflow visible to the scroll view's style, it will behave like hidden unless you change the overflow property of this container view.
           This is done by the following reasons.
              - On Android, header or bottom tabbars are opaque by default, so overflow hidden is usually not a problem.
              - Bug where overflow visible is ignored for unknown reason if ScrollView has RefreshControl .
              - If the overflow of the container view is not hidden, even if the overflow of the scroll view is hidden, there is a bug that the refresh control created from above still appears outside the scroll view.
           */
            [Platform.OS !== "ios" && "overflow-hidden"]
          ),
          { paddingTop: 30 },
          containerStyle,
        ])}
      >
        <ParallaxScrollView
          onScroll={onScroll}
          ref={ref}
          stickyHeaderHeight={STICKY_HEADER_HEIGHT}
          parallaxHeaderHeight={parallaxHeaderHeight}
          showsVerticalScrollIndicator={false}
          contentBackgroundColor={style.get("color-transparent").color}
          backgroundSpeed={10}
          backgroundColor={style.get("color-transparent").color}
          style={StyleSheet.flatten([
            style.flatten([
              "flex-1",
              "padding-0",
              "overflow-visible",
            ]) as ViewStyle,
            propStyle,
          ])}
          renderScrollComponent={() => (
            <AnimatedKeyboardAwareScrollView
              innerRef={(_ref) => {
                if (ref) {
                  // I don't know why the _ref's type is JSX.Element
                  if (typeof ref === "function") {
                    ref(_ref as any);
                  } else {
                    ref.current = _ref as any;
                  }
                }
              }}
              style={StyleSheet.flatten([
                style.flatten([
                  "flex-1",
                  "padding-0",
                  "overflow-visible",
                ]) as ViewStyle,
                propStyle,
              ])}
              keyboardOpeningTime={0}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: { contentOffset: { y: scrollY } },
                  },
                ],
                { useNativeDriver: true, listener: onScroll }
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
          renderForeground={() => (
            <View style={styles.parallaxHeader}>
              <Text style={style.flatten(["color-white", "h1", "font-medium"])}>
                {headerTitle}
              </Text>
            </View>
          )}
          renderStickyHeader={() => (
            <View style={styles.stickySection}>
              <Text style={styles.stickySectionText}>{headerTitle}</Text>
            </View>
          )}
          renderFixedHeader={() => (
            <View style={styles.fixedSection}>
              <IconButton
                borderRadius={32}
                icon={<HeaderBackButtonIcon color="white" size={21} />}
                backgroundBlur={false}
                iconStyle={
                  style.flatten([
                    "width-54",
                    "border-width-1",
                    "border-color-gray-300",
                    "padding-x-14",
                    "padding-y-6",
                    "justify-center",
                    "items-center",
                    "margin-top-24",
                  ]) as ViewStyle
                }
                onPress={() => navigation.goBack()}
              />
            </View>
          )}
          {...restProps}
        />
        <View
          style={[
            [
              Platform.OS == "android"
                ? (style.flatten([
                    "absolute",
                    "width-full",
                    "height-full",
                  ]) as ViewStyle)
                : (style.get("margin-bottom-32") as ViewStyle),
            ],
            propStyle,
          ]}
        >
          {fixed}
        </View>
      </ContainerElement>
    </React.Fragment>
  );
});

PageWithScrollViewHeader.displayName = "PageWithScrollViewHeader";
const styles = StyleSheet.create({
  stickySection: {
    height: 70,
  },
  stickySectionText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    top: 28,
    left: 16,
  },
  fixedSection: {
    position: "absolute",
    left: 20,
  },
  parallaxHeader: {
    flex: 1,
    marginTop: 80,
  },
  sectionSpeakerText: {
    color: "white",
    fontSize: 30,
  },
});
