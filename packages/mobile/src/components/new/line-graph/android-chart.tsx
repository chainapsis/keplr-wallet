import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { LineChart, Path as ChartPath } from "react-native-svg-charts";
import * as shape from "d3-shape";
import {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
  Text as SvgText,
  Path,
  Rect,
  Line,
} from "react-native-svg";
import { PanResponder, Dimensions, View } from "react-native";

export const AndroidLineChart: FunctionComponent<{
  data: any;
  height?: number;
}> = ({ data, height }) => {
  const valueList = data.map((d: { value: any }) => d.value);
  const dateList = data.map((d: { date: any }) => d.date);

  const apx = (size = 0) => {
    const width = Dimensions.get("window").width;
    return (width / 750) * size;
  };
  const size = useRef(dateList.length);

  useEffect(() => {
    size.current = dateList.length;
  }, [dateList]);

  const Gradient = () => (
    <Defs key={"gradient"}>
      <LinearGradient id={"gradient"} x1={"0"} y1={"0%"} x2={"0%"} y2={"100%"}>
        <Stop offset={"0%"} stopColor={"#F9774B"} />
        <Stop offset={"50%"} stopColor={"#CF447B"} />
        <Stop offset={"100%"} stopColor={"#5F38FB"} />
      </LinearGradient>
    </Defs>
  );

  const Shadow = ({ line }: any) => (
    <ChartPath
      key={"shadow"}
      y={2}
      d={line}
      fill={"none"}
      strokeWidth={4}
      stroke={"rgba(134, 65, 244, 0.2)"}
    />
  );

  const [positionX, setPositionX] = useState(-1); // The currently selected X coordinate position

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_evt, _gestureState) => true,
      onStartShouldSetPanResponderCapture: (_evt, _gestureState) => true,
      onMoveShouldSetPanResponder: (_evt, _gestureState) => true,
      onMoveShouldSetPanResponderCapture: (_evt, _gestureState) => true,
      onPanResponderTerminationRequest: (_evt, _gestureState) => true,

      onPanResponderGrant: (evt, _gestureState) => {
        updatePosition(evt.nativeEvent.locationX);
        return true;
      },
      onPanResponderMove: (evt, _gestureState) => {
        updatePosition(evt.nativeEvent.locationX);
        return true;
      },
      onPanResponderRelease: () => {
        setPositionX(-1);
      },
    })
  );

  const updatePosition = (x: number) => {
    const YAxisWidth = apx(130);
    const x0 = apx(0); // x0 position
    const chartWidth = apx(750) - YAxisWidth - x0;
    const xN = x0 + chartWidth; //xN position
    const xDistance = chartWidth / size.current; // The width of each coordinate point
    if (x <= x0) {
      x = x0;
    }
    if (x >= xN) {
      x = xN;
    }

    let value = Number(((x - x0) / xDistance).toFixed(0));
    if (value >= size.current - 1) {
      value = size.current - 1; // Out of chart range, automatic correction
    }

    setPositionX(Number(value));
  };

  const Tooltip = ({ x, y }: any) => {
    if (positionX < 0) {
      return null;
    }

    const date = dateList[positionX];

    return (
      <G x={x(positionX)} key="tooltip">
        <G
          x={
            positionX > size.current / 1.2
              ? -apx(170 + 10)
              : positionX < size.current / 10
              ? apx(5)
              : -apx(70)
          }
          y={
            y(valueList[positionX]) > 100
              ? y(valueList[positionX]) - apx(100)
              : y(valueList[positionX]) - apx(-70)
          }
        >
          <Rect y={-apx(24 + 24 + 20) / 2} />
          <SvgText
            x={apx(45)}
            fontSize={apx(24)}
            fontWeight="bold"
            fill="#FFFFFF"
          >
            ${valueList[positionX]}
          </SvgText>
          <SvgText
            x={apx(20)}
            y={apx(24 + 20)}
            fill="#C6C6CD"
            fontSize={apx(24)}
          >
            {date}
          </SvgText>
        </G>

        <G x={x}>
          <Circle
            cy={y(valueList[positionX])}
            r={apx(20 / 2)}
            stroke="#fff"
            strokeWidth={apx(2)}
            fill="#FEBE18"
          />
          <Line
            y1={y(valueList[positionX])}
            y2={200}
            stroke="#C6C6CD"
            strokeWidth={apx(3)}
            strokeDasharray={[6, 6]}
          />
        </G>
      </G>
    );
  };

  const CustomLine = ({ line }: any) => (
    <Path key="line" d={line} strokeWidth={apx(1)} fill="none" />
  );

  const dynamicHeight = height && height >= 200 ? height : 200;
  return (
    <View {...panResponder.current.panHandlers}>
      <LineChart
        style={{ height: dynamicHeight }}
        data={valueList}
        contentInset={{ top: 20, bottom: 20 }}
        animation={true}
        animationDuration={1200}
        animateOnDataChange={true}
        onDataChangeAnimationDuration={300}
        curve={shape.curveNatural}
        svg={{
          strokeWidth: 2,
          stroke: "url(#gradient)",
        }}
      >
        <CustomLine />
        <Gradient />
        <Tooltip />
        <Shadow />
      </LineChart>
    </View>
  );
};
