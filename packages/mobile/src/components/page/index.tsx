import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { flex1, absoluteLayout, p2 } from "../../styles";
import { GradientBackground } from "../svg";

/**
 * The container for each pages.
 * @constructor
 */
export const Page: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <ScrollView style={absoluteLayout}>
        <View style={p2}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const FixedPage: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={absoluteLayout}>{children}</View>
    </SafeAreaView>
  );
};
