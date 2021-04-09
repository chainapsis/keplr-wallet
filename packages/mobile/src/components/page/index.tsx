import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

/**
 * The container for each pages.
 * @constructor
 */
export const Page: FunctionComponent = ({ children }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        <View style={{ padding: 10 }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
};
