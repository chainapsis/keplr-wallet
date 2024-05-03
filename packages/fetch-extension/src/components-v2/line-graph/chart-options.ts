import { ChartOptions } from "chart.js";

export const chartOptions: ChartOptions = {
  legend: { display: false },
  maintainAspectRatio: false,
  scales: {
    xAxes: [
      {
        display: false,
        gridLines: { display: false },
        ticks: { display: false },
      },
    ],
    yAxes: [{ ticks: { display: false }, gridLines: { display: false } }],
  },
  tooltips: {
    mode: "index",
    intersect: false,
    backgroundColor: "transparent",
    bodyFontColor: "rgba(255,255,255,0.6)",
    displayColors: false,
    caretSize: 3,
    callbacks: {
      label: (tooltipItem: any, data: any) => {
        const label = data.datasets[tooltipItem.datasetIndex].label || "";
        const value = tooltipItem.yLabel || "";
        return ` ${label} ${value} USD`;
      },
    },
  },
  elements: {
    line: {
      borderWidth: 2,
    },
  },
};
