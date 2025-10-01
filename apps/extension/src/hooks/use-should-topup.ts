import { FeeConfig } from "@keplr-wallet/hooks";
import { SenderConfig } from "@keplr-wallet/hooks";
import { IBaseAmountConfig } from "@keplr-wallet/hooks";
import { InsufficientFeeError } from "@keplr-wallet/hooks";
import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";

export function useShouldTopup({
  feeConfig,
  senderConfig,
  amountConfig,
}: {
  feeConfig: FeeConfig;
  senderConfig: SenderConfig;
  amountConfig: IBaseAmountConfig;
}): {
  shouldTopup: boolean;
  remainingText: string | undefined;
  isTopUpAvailable: boolean;
} {
  const { chainStore, queriesStore } = useStore();
  const isOsmosis =
    chainStore.hasChain(feeConfig.chainId) &&
    chainStore.getChain(feeConfig.chainId).hasFeature("osmosis-txfees");

  // Osmosis의 경우에는 모든 fee currency가 (수수료 + 동일 denom 전송/스왑 금액) 부족할 경우에만 topup 사용이 가능
  const allFeeCurrenciesInsufficient = (() => {
    const queryBalances = queriesStore
      .get(feeConfig.chainId)
      .queryBalances.getQueryBech32Address(senderConfig.sender);

    for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
      const requiredFee = feeConfig.getFeeTypePrettyForFeeCurrency(
        feeCurrency,
        feeConfig.type === "manual" ? "average" : feeConfig.type
      );

      const totalNeed = (() => {
        if (!isOsmosis) return requiredFee;
        let need = requiredFee;
        for (const amt of amountConfig.amount) {
          if (amt.currency.coinMinimalDenom === feeCurrency.coinMinimalDenom) {
            need = need.add(amt);
          }
        }
        return need;
      })();

      const bal = queryBalances.getBalance(feeCurrency)?.balance;
      if (!bal || bal.toDec().lte(new Dec(0))) {
        continue;
      }

      if (bal.toDec().gte(totalNeed.toDec())) {
        return false;
      }
    }

    return feeConfig.selectableFeeCurrencies.length > 0;
  })();

  const shouldTopup =
    (feeConfig.topUpStatus.isTopUpAvailable ||
      feeConfig.topUpStatus.remainingTimeMs !== undefined) &&
    (isOsmosis
      ? allFeeCurrenciesInsufficient
      : feeConfig.uiProperties.warning instanceof InsufficientFeeError);

  const isTopUpAvailable = feeConfig.topUpStatus.isTopUpAvailable;

  const [remainingTimeMs, setRemainingTimeMs] = useState<number>();

  const remainingText = (() => {
    if (remainingTimeMs === undefined) return undefined;
    const minutes = Math.floor(remainingTimeMs / 60000);
    const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
    return `Wait ${minutes}:${seconds.toString().padStart(2, "0")}`;
  })();

  useEffect(() => {
    setRemainingTimeMs(feeConfig.topUpStatus.remainingTimeMs);
  }, [feeConfig.topUpStatus]);

  useEffect(() => {
    if (remainingTimeMs === undefined || remainingTimeMs <= 0) return;

    const interval = setInterval(() => {
      setRemainingTimeMs((prev) => {
        if (prev === undefined) return undefined;
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [remainingTimeMs]);

  // topup 필요 시 강제로 기본 수수료 통화 적용
  useEffect(() => {
    if (!shouldTopup) return;

    const baseFeeCurrency = chainStore.getChain(feeConfig.chainId)
      .feeCurrencies[0];
    if (!baseFeeCurrency) return;

    const currentFeeDenom = feeConfig.fees[0]?.currency.coinMinimalDenom;
    if (currentFeeDenom === baseFeeCurrency.coinMinimalDenom) return;

    feeConfig.setFee({
      type: "average",
      currency: baseFeeCurrency,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldTopup]);

  return { shouldTopup, remainingText, isTopUpAvailable };
}
