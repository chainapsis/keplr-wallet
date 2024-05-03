import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { LinearGradient, Stop } from "react-native-svg";
import { useStyle } from "styles/index";

export const IOSLineChart: FunctionComponent<{
  data: any;
  height?: number;
}> = ({ data, height }) => {
  const style = useStyle();

  const maxValue = Number(
    Math.max(...data.map((v: { value: any }) => v.value))
  );

  const minValue = Number(
    Math.min(...data.map((v: { value: any }) => v.value))
  );

  const chartMaxValue = Number(maxValue - minValue);

  return (
    <LineChart
      // chart variable
      areaChart={true}
      height={height}
      areaGradientComponent={() => {
        return (
          <LinearGradient id="Gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={"#F9774B"} stopOpacity={"0.4"} />
            <Stop offset="0.5" stopColor={"#CF447B"} stopOpacity={"0.2"} />
            <Stop offset="1" stopColor={"#5F38FB"} stopOpacity={"0"} />
          </LinearGradient>
        );
      }}
      data={data}
      curved={true}
      //   animation variable
      isAnimated={true}
      animationDuration={1200}
      animateOnDataChange={true}
      onDataChangeAnimationDuration={300}
      // data points variable
      hideDataPoints={true}
      adjustToWidth={true}
      thickness={2}
      initialSpacing={0}
      endSpacing={0}
      // y label variable
      showFractionalValues={true}
      maxValue={chartMaxValue}
      yAxisOffset={minValue}
      // y axis variable
      disableScroll={true}
      yAxisThickness={0}
      yAxisColor={"lightgray"}
      hideYAxisText={true}
      xAxisThickness={0}
      // horizontal line vriable
      hideRules={true}
      // line variable
      lineGradient={true}
      lineGradientId="lineGradient"
      lineGradientComponent={() => {
        return (
          <LinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={"#F9774B"} />
            <Stop offset="0.5" stopColor={"#CF447B"} />
            <Stop offset="1" stopColor={"#5F38FB"} />
          </LinearGradient>
        );
      }}
      pointerConfig={{
        pointerStripUptoDataPoint: true,
        pointerStripColor: "lightgray",
        strokeDashArray: [8, 8],
        pointerColor: "lightgray",
        pointerLabelHeight: 50,
        activatePointersOnLongPress: true,
        autoAdjustPointerLabelPosition: true,
        showPointerStrip: true,
        pointerLabelComponent: (items: any) => {
          return (
            <View
              style={{
                width: 100,
              }}
            >
              <Text
                style={
                  style.flatten([
                    "color-white",
                    "text-caption2",
                    "font-medium",
                    "margin-bottom-4",
                    "text-center",
                  ]) as ViewStyle
                }
              >
                {"$" + (items[0].value + minValue).toFixed(2)}
              </Text>

              <Text
                style={
                  style.flatten([
                    "text-center",
                    "color-gray-200",
                    "text-caption2",
                    "font-medium",
                  ]) as ViewStyle
                }
              >
                {items[0].date}
              </Text>
            </View>
          );
        },
      }}
    />
  );
};
