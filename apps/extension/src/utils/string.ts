export const stringLengthByGrapheme = (str: string): number => {
  if (
    typeof Intl !== "undefined" &&
    "Segmenter" in Intl &&
    typeof Intl.Segmenter !== "undefined"
  ) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return [...segmenter.segment(str)].length;
  }
  // 만약 Intl.Segmenter가 지원되지 않는 경우, Array.from을 사용하여 분리함
  // 이때 👩🏻‍🌾 이모지 같이 조합된 이모지는 여러개로 취급 때문에 올바르게 처리되지 않을 수 있음
  return Array.from(str).length;
};
