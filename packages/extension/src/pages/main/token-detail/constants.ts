export const Relations = [
  "send",
  "receive",
  "ibc-send",
  "ibc-send-receive",
  "ibc-send-refunded",
  "delegate",
  "undelegate",
  "redelegate",
  "cancel-undelegate",
  "vote",
  "custom/merged-claim-rewards",
  "ibc-swap-skip-osmosis",
  "ibc-swap-skip-osmosis-receive",
  "ibc-swap-skip-osmosis-refunded",
];

// TODO: 지금은 scroll to fetch 테스트 용으로 값이 좀 작은거고 나중에는 20으로 올려야함.
export const PaginationLimit = 8;
