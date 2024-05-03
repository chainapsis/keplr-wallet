import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { formatTimestamp } from "utils/format-time-stamp/parse-timestamp-to-date";
import { Platform, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { AndroidLineChart } from "./android-chart";
import { IOSLineChart } from "./ios-chart";
import { useStore } from "stores/index";

interface DurationData {
  [key: string]: DurationObject;
}

interface DurationObject {
  chartData: ChartData[];
  tokenState: TokenStateData;
  isError: boolean;
}

export interface ChartData {
  value: number;
  date: string;
}

interface TokenStateData {
  diff: number;
  time: string;
  type: "positive" | "negative";
}

export const LineGraph: FunctionComponent<{
  tokenName: string | undefined;
  duration: string;
  setTokenState: any;
  tokenState?: any;
  height?: number;
}> = ({ tokenName, duration, setTokenState, height }) => {
  const style = useStyle();
  const { priceStore, chainStore } = useStore();
  const [durationData, setDuration] = useState<DurationData>({});
  const [chartsData, setChartData] = useState<ChartData[]>([]);

  let fetValue;
  const cacheKey = useMemo(
    () => `${tokenName}_${duration}`,
    [tokenName, duration]
  );

  function getTimeLabel() {
    switch (duration) {
      default:
      case "1":
        return "TODAY";
      case "7":
        return "1 WEEK";
      case "30":
        return "1 MONTH";
      case "90":
        return "3 MONTH";
      case "365":
        return "1 YEAR";
      case "max":
        return "ALL";
    }
  }

  const setDefaultPricing = useCallback(() => {
    const tokenState: TokenStateData = {
      diff: 0,
      time: getTimeLabel(),
      type: "positive",
    };
    const chartDataList: ChartData[] = [];
    const timestamp = new Date().getTime();
    const date = formatTimestamp(timestamp);

    for (let i = 0; i < 5; i++) {
      chartDataList.push({ value: 0, date });
    }

    durationData[cacheKey] = {
      chartData: [...chartDataList],
      tokenState: tokenState,
      isError: true,
    };

    setChartData(chartDataList);
    setTokenState(tokenState);
    setDuration(durationData);
  }, [tokenName, duration]);

  function getChartData() {
    return new Promise(async (resolve, reject) => {
      try {
        let chartDataList: ChartData[] = [];
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenName}/market_chart`;
        const params = {
          vs_currency: priceStore.defaultVsCurrency,
          days: duration,
        };

        const response = await axios.get(apiUrl, { params });
        chartDataList = response.data.prices.map((price: number[]) => ({
          date: formatTimestamp(price[0]),
          value: Number(price[1].toFixed(3)),
        }));

        let tokenState = {};

        if (chartDataList.length > 0) {
          const firstValue = chartDataList[0].value || 0;
          const lastValue = chartDataList[chartDataList.length - 1].value || 0;
          const diff = lastValue - firstValue;
          const percentageDiff = (diff / lastValue) * 100;

          const type = diff >= 0 ? "positive" : "negative";

          tokenState = {
            diff: Math.abs(percentageDiff),
            time: getTimeLabel(),
            type,
          };
        }
        resolve({ chartDataList, tokenState });
      } catch (error) {
        reject(error);
      }
    });
  }

  useEffect(() => {
    if (
      (durationData[cacheKey]?.chartData.length ?? 0) == 0 ||
      (durationData[cacheKey]?.isError ?? false)
    ) {
      getChartData()
        .then((obj: any) => {
          setTokenState(obj.tokenState);

          setChartData(obj.chartDataList);
          durationData[cacheKey] = {
            chartData: [...obj.chartDataList],
            tokenState: obj.tokenState,
            isError: false,
          };
          setDuration(durationData);
        })
        .catch((error) => {
          setDefaultPricing();
          console.log("Error fetching data:", error.message);
        });
    } else {
      setTokenState(durationData[cacheKey].tokenState);
      setChartData(durationData[cacheKey].chartData);
    }
  }, [cacheKey]);

  if (chartsData.length !== 0) {
    fetValue = Number(chartsData.slice(-1)[0].value);
  } else {
    fetValue = 0;
  }

  return (
    <View
      style={[style.flatten(["margin-top-24", "overflow-hidden"])] as ViewStyle}
    >
      <Text
        style={
          style.flatten([
            "text-caption2",
            "text-center",
            "color-white",
          ]) as ViewStyle
        }
      >
        {`${chainStore.current.currencies[0].coinDenom}/USD `}
        <Text
          style={style.flatten(["color-white@60%"]) as ViewStyle}
        >{`$${fetValue.toFixed(2)}`}</Text>
      </Text>
      {Platform.OS == "ios" ? (
        <IOSLineChart data={chartsData} height={height} />
      ) : (
        <AndroidLineChart data={chartsData} height={height} />
      )}
    </View>
  );
};
