export const chains = {
  "uni-3": {
    chainId: "uni-3" as const,
    label: "Juno Testnet",
    prefix: "juno",
    currentCodeId: 3352,
    rcp: "https://rpc.uni.junonetwork.io/",
    denom: "ujunox",
  },
  "juno-1": {
    chainId: "juno-1" as const,
    label: "Juno",
    prefix: "juno",
    currentCodeId: 843,
    rcp: "https://rpc-juno.itastakers.com/",
    denom: "ujuno",
  },
};

export type Chain = keyof typeof chains;
