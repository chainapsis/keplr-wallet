import React, { FunctionComponent, ReactElement } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useStyle } from "styles/index";

export interface TimelineProps {
  icon?: ReactElement;
  leadingTitle?: string;
  leadingSubtitle?: string;
  trailingTitle?: string;
  trailingSubtitle?: string;
}

export const TimelineView: FunctionComponent<{
  data: TimelineProps[];
  trailingTitleStyle?: TextStyle;
}> = ({ data, trailingTitleStyle }) => {
  const style = useStyle();
  const renderItem = ({
    item,
    index,
  }: {
    item: TimelineProps;
    index: number;
  }) => {
    const lastIndex = index === data.length - 1;
    return (
      <View
        key={index}
        style={
          style.flatten([
            "flex-1",
            "flex-row",
            "items-start",
            "justify-center",
          ]) as ViewStyle
        }
      >
        <View style={[styles.leftColumn]}>
          {item.icon ? (
            item.icon
          ) : (
            <View style={[styles.dotContainer]}>
              <View style={[styles.dot]} />
            </View>
          )}
          {!lastIndex && <View style={[styles.connector]} />}
        </View>
        <View style={style.flatten(["flex-1", "flex-row"]) as ViewStyle}>
          <View
            style={
              style.flatten([
                "items-start",
                "flex-column",
                "justify-center",
              ]) as ViewStyle
            }
          >
            {item.leadingTitle && (
              <Text style={style.flatten(["color-gray-300"]) as ViewStyle}>
                {item.leadingTitle}
              </Text>
            )}
            {item.leadingSubtitle && (
              <Text style={style.flatten(["color-white"]) as ViewStyle}>
                {item.leadingSubtitle}
              </Text>
            )}
          </View>
          <View style={style.flatten(["flex-1"]) as ViewStyle} />
          <View
            style={
              style.flatten([
                "items-end",
                "flex-column",
                "justify-center",
              ]) as ViewStyle
            }
          >
            {item.trailingTitle && (
              <Text
                style={
                  trailingTitleStyle
                    ? trailingTitleStyle
                    : (style.flatten(["color-white"]) as ViewStyle)
                }
              >
                {item.trailingTitle}
              </Text>
            )}
            {item.trailingSubtitle && (
              <Text style={style.flatten(["color-white"]) as ViewStyle}>
                {item.trailingSubtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };
  return <FlatList scrollEnabled={false} data={data} renderItem={renderItem} />;
};

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  leftColumn: {
    zIndex: 999,
    position: "relative",
    alignItems: "center",
    marginRight: 20,
  },
  connector: {
    height: 40,
    width: 1,
    backgroundColor: "white",
    opacity: 0.3,
  },
  dotContainer: {
    backgroundColor: "#D9F3FD",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
  },
  dot: {
    backgroundColor: "#408E91",
    borderRadius: 50,
    width: 10,
    height: 10,
  },
});
