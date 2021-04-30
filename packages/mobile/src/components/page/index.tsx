import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { flex1, absoluteLayout, p2, sf } from "../../styles";
import { GradientBackground } from "../svg";

/**
 * The container for each pages.
 * @constructor
 */
export const SafeAreaPage: FunctionComponent = ({ children }) => {
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

export const FullPage: FunctionComponent = ({ children }) => {
  return (
    <View style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={sf([absoluteLayout, p2])}>{children}</View>
    </View>
  );
};

export const FullPageWithoutPadding: FunctionComponent = ({ children }) => {
  return (
    <View style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={sf([absoluteLayout])}>{children}</View>
    </View>
  );
};

export const FixedPage: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={sf([absoluteLayout, p2])}>{children}</View>
    </SafeAreaView>
  );
};
