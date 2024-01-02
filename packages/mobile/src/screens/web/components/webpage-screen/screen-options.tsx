import React from "react";
import { View } from "react-native";
import { Header, TransitionPresets } from "@react-navigation/stack";

/**
 * WebpageScreenScreenOptionsPreset defines the screen options for the webpage screen component.
 * This hides the header and assume that the webpage screen component will render the header on the screen itself.
 * We need to deliver the information and method related to webview (like canGoBack(), goBack()...).
 * But, it is hard to achieve this with the react native naviation's header architecture.
 * So, to solve this problem simply, just do not use the react native naviation's header and render the web screen header directly in the sceen.
 * And, don't disable the header but hide the header because disabling the header makes the `useHeaderHeight()` hook return the 0.
 */
export const WebpageScreenScreenOptionsPreset = {
  headerTransparent: true,
  // eslint-disable-next-line react/display-name
  header: (props: any) => {
    return (
      <View style={{ opacity: 0 }} pointerEvents="none">
        <Header {...props} />
      </View>
    );
  },
  gestureEnabled: false,
  ...TransitionPresets.SlideFromRightIOS,
};
