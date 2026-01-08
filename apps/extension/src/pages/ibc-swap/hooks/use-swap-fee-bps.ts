import { useEffect, useState } from "react";
import { SwapFeeBps } from "../../../config.ui";
import { useStore } from "../../../stores";
import {
  IBCSwapAmountConfig,
  SwapAmountConfig,
} from "@keplr-wallet/hooks-internal";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const useSwapFeeBps = (
  amountConfig: IBCSwapAmountConfig | SwapAmountConfig
) => {
  const { queriesStore, chainStore } = useStore();

  const [swapFeeBps, setSwapFeeBps] = useState(SwapFeeBps.value);

  const querySwapFeeBps = queriesStore.simpleQuery.queryGet<{
    swapFeeBps?: number;
    stableSwap?: {
      feeBps?: number;
      coins?: string[];
    };
  }>(process.env["KEPLR_EXT_CONFIG_SERVER"], "/swap-fee/info-v2.json");

  useEffect(() => {
    const defaultSwapFeeBps = SwapFeeBps.value;
    if (querySwapFeeBps.response) {
      const inOut: [
        {
          chainId: string;
          coinMinimalDenom: string;
        },
        {
          chainId: string;
          coinMinimalDenom: string;
        }
      ] = [
        (() => {
          const currency = amountConfig.amount[0].currency;
          if (
            "originChainId" in currency &&
            "originCurrency" in currency &&
            currency.originChainId &&
            currency.originCurrency
          ) {
            return {
              chainId: currency.originChainId,
              coinMinimalDenom: currency.originCurrency.coinMinimalDenom,
            };
          }
          return {
            chainId: amountConfig.chainId,
            coinMinimalDenom: currency.coinMinimalDenom,
          };
        })(),
        (() => {
          const currency = amountConfig.outCurrency;
          if (
            "originChainId" in currency &&
            "originCurrency" in currency &&
            currency.originChainId &&
            currency.originCurrency
          ) {
            return {
              chainId: currency.originChainId,
              coinMinimalDenom: currency.originCurrency.coinMinimalDenom,
            };
          }
          return {
            chainId: amountConfig.outChainId,
            coinMinimalDenom: currency.coinMinimalDenom,
          };
        })(),
      ];

      const [inTokenKey, outTokenKey] = inOut.map(
        ({ chainId, coinMinimalDenom }) => {
          return `${
            ChainIdHelper.parse(chainId).identifier
          }/${coinMinimalDenom}`;
        }
      );

      const stableSwap = querySwapFeeBps.response.data["stableSwap"];
      const coinsSet = stableSwap?.coins
        ? new Set(stableSwap.coins.map((coin) => coin.toLowerCase()))
        : undefined;
      if (
        stableSwap &&
        coinsSet &&
        coinsSet.has(inTokenKey.toLowerCase()) &&
        coinsSet.has(outTokenKey.toLowerCase()) &&
        stableSwap.feeBps != null
      ) {
        setSwapFeeBps(stableSwap.feeBps);
      } else if (querySwapFeeBps.response.data["swapFeeBps"] != null) {
        const fee = querySwapFeeBps.response.data["swapFeeBps"];
        if (fee != null) {
          setSwapFeeBps(fee);
        }
      } else {
        setSwapFeeBps(defaultSwapFeeBps);
      }
    } else {
      setSwapFeeBps(defaultSwapFeeBps);
    }
  }, [
    chainStore,
    amountConfig.amount,
    amountConfig.chainId,
    amountConfig.outChainId,
    amountConfig.outCurrency,
    querySwapFeeBps.response,
  ]);

  return swapFeeBps;
};
