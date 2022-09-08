export const chains = {
  "uni-3": {
    chainId: "uni-3" as const,
    label: "Juno Testnet",
    prefix: "juno",
    currentCodeId: 3454,
    rcp: "https://rpc.uni.junonetwork.io/",
    denom: "ujunox",
    startingUsdDebt: "500000",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    twilioPhoneNumber: "+19705509509",
    twilioUrl:
      "https://studio.twilio.com/v2/Flows/FW2de98dc924361e35906dad1ed6125dc6/Executions",
  },
  "juno-1": {
    chainId: "juno-1" as const,
    label: "Juno",
    prefix: "juno",
    currentCodeId: 843,
    rcp: "https://rpc-juno.itastakers.com/",
    denom: "ujuno",
    startingUsdDebt: "500000",
    debtRepayAddress: "juno1ruftad6eytmr3qzmf9k3eya9ah8hsnvkujkej8",
    twilioPhoneNumber: "+19148638557",
    twilioUrl:
      "https://studio.twilio.com/v2/Flows/FW278a8ada7d869a2bbfc49915dbb534f5/Executions",
  },
};

export type Chain = keyof typeof chains;
