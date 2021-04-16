import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { GradientBackground } from "../svg";

/**
 * The container for each pages.
 * @constructor
 */
export const Page: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <GradientBackground />
      </View>
      <ScrollView
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <View style={{ padding: 10 }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const FixedPage: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <GradientBackground />
      </View>
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};
