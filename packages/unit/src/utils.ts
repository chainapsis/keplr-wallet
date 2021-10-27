type ToMetric = (deep: number) => { remainder: number; prefix: string };
export const toMetric: ToMetric = (deep) => {
  switch (true) {
    case deep >= 18:
      return { remainder: deep - 18, prefix: "atto" };
    case deep >= 15:
      return { remainder: deep - 15, prefix: "femto" };
    case deep >= 12:
      return { remainder: deep - 12, prefix: "pico" };
    case deep >= 9:
      return { remainder: deep - 9, prefix: "nano" };
    case deep >= 6:
      return { remainder: deep - 6, prefix: "micro" };
    case deep >= 3:
      return { remainder: deep - 3, prefix: "milli" };
  }

  return { remainder: 0, prefix: "" };
};
