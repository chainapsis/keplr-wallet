import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { flex1, absoluteLayout, p3, sf } from "../../styles";
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
      <ScrollView style={sf([absoluteLayout, p3])}>{children}</ScrollView>
    </SafeAreaView>
  );
};

export const SafeAreaFixedPage: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={sf([absoluteLayout, p3])}>{children}</View>
    </SafeAreaView>
  );
};

export const FullPage: FunctionComponent = ({ children }) => {
  return (
    <View style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <ScrollView style={sf([absoluteLayout, p3])}>{children}</ScrollView>
    </View>
  );
};

export const FullFixedPage: FunctionComponent = ({ children }) => {
  return (
    <View style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={sf([absoluteLayout, p3])}>{children}</View>
    </View>
  );
};

export const FullFixedPageWithoutPadding: FunctionComponent = ({
  children,
}) => {
  return (
    <View style={flex1}>
      <View style={absoluteLayout}>
        <GradientBackground />
      </View>
      <View style={sf([absoluteLayout])}>{children}</View>
    </View>
  );
};
