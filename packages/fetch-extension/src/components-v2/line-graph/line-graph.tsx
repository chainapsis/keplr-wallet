import { formatTimestamp } from "@utils/parse-timestamp-to-date";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { chartOptions } from "./chart-options";
import style from "./style.module.scss";

interface LineGraphProps {
  duration: number;
  tokenName: string | undefined;
  setTokenState: any;
  loading: boolean;
  setLoading: any;
}

interface PriceData {
  timestamp: number;
  price: number;
}

export const LineGraph: React.FC<LineGraphProps> = ({
  duration,
  tokenName,
  setTokenState,
  loading,
  setLoading,
}) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = useMemo(
    () => `${tokenName}_${duration}`,
    [tokenName, duration]
  );

  const cachedPrices = useMemo(() => {
    const cachedData = sessionStorage.getItem(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }, [cacheKey]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        let newPrices: any[] = [];
        if (cachedPrices) {
          newPrices = cachedPrices;
        } else {
          const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenName}/market_chart`;
          const params = { vs_currency: "usd", days: duration };

          const response = await axios.get(apiUrl, { params });
          newPrices = response.data.prices.map((price: number[]) => ({
            timestamp: price[0],
            price: price[1],
          }));

          sessionStorage.setItem(cacheKey, JSON.stringify(newPrices));
        }
        if (newPrices.length > 0) {
          const firstValue = newPrices[0].price || 0;
          const lastValue = newPrices[newPrices.length - 1].price || 0;
          const diff = lastValue - firstValue;
          const percentageDiff = (diff / lastValue) * 100;
          let time = "";
          if (duration === 1) time = "TODAY";
          else if (duration === 7) time = "1 WEEK";
          else if (duration === 30) time = "1 MONTH";
          else if (duration === 90) time = "3 MONTH";
          else if (duration === 360) time = "1 YEAR";
          else if (duration === 100000) time = "ALL";

          const type = diff >= 0 ? "positive" : "negative";

          setTokenState({ diff: Math.abs(percentageDiff), time, type });
        }
        setPrices(newPrices);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Unable to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [duration, tokenName, cacheKey, cachedPrices, setTokenState]);

  const chartData = {
    labels: prices.map((priceData: any) => {
      const time = formatTimestamp(
        new Date(priceData.timestamp).toLocaleString()
      );
      return time;
    }),
    datasets: [
      {
        label: "",
        backgroundColor: "transparent",
        data: prices.map((priceData: any) =>
          priceData.price.toFixed(3).toString()
        ),
        fill: false,
        borderColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (
            !chartArea ||
            !isFinite(chartArea.left) ||
            !isFinite(chartArea.top) ||
            !isFinite(chartArea.right) ||
            !isFinite(chartArea.bottom)
          ) {
            return null;
          }

          const gradient = ctx.createLinearGradient(
            0, // Change this to 0
            chartArea.top,
            0, // Change this to 0
            chartArea.bottom
          );
          gradient.addColorStop(0, "#5F38FB"); // Start color
          gradient.addColorStop(1, "#F9774B"); // End color

          return gradient;
        },
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className={style["line-graph"]}>
      {loading ? (
        <div>
          {error ? (
            <div>{error}</div>
          ) : (
            <div>
              Loading...
              <i
                className="fas fa-spinner fa-spin ml-2"
                style={{ color: "white" }}
              />
            </div>
          )}
        </div>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
};
