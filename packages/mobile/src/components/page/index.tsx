import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView } from "react-native";

/**
 * The container for each pages.
 * @constructor
 */
export const Page: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView>
      <ScrollView>{children}</ScrollView>
    </SafeAreaView>
  );
};
