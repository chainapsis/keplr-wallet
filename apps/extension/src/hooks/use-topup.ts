import { FeeConfig } from "@keplr-wallet/hooks";
import { SenderConfig } from "@keplr-wallet/hooks";
import { IBaseAmountConfig } from "@keplr-wallet/hooks";
import { InsufficientFeeError } from "@keplr-wallet/hooks";
import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";
import { useEffect, useState } from "react";
import { TopUpClient } from "@keplr-wallet/topup-client";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { useIntl } from "react-intl";

export interface TopUpParams {
  feeConfig: FeeConfig;
  senderConfig: SenderConfig;
  amountConfig: IBaseAmountConfig;
  hasHardwareWalletError?: boolean;
}

export interface TopUpResult {
  shouldTopUp: boolean;
  remainingText: string | undefined;
  isTopUpAvailable: boolean;
  isInsufficientFeeWarning: boolean;
  isTopUpInProgress: boolean;
  executeTopUpIfAvailable: () => Promise<void>;
  topUpError: Error | undefined;
}

export function useTopUp({
  feeConfig,
  senderConfig,
  amountConfig,
  hasHardwareWalletError,
}: TopUpParams): TopUpResult {
  const { chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const [isTopUpInProgress, setIsTopUpInProgress] = useState(false);
  const [topUpCompleted, setTopUpCompleted] = useState(false);
  const [topUpError, setTopUpError] = useState<Error | undefined>(undefined);

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

  // CHECK: shouldTopUp일 때 max 버튼 누르면 fee를 제외하지 않도록 수정 필요한지 확인
  // TODO: send token인 경우, selected token의 amount가 0이면 안됨
  const shouldTopUp =
    !topUpCompleted &&
    !hasHardwareWalletError &&
    (feeConfig.topUpStatus.isTopUpAvailable ||
      feeConfig.topUpStatus.remainingTimeMs !== undefined) &&
    (isOsmosis
      ? allFeeCurrenciesInsufficient
      : feeConfig.uiProperties.warning instanceof InsufficientFeeError);

  const isTopUpAvailable = feeConfig.topUpStatus.isTopUpAvailable;

  // NOTE: osmosis의 경우 모든 수수료 토큰이 부족한지 체크하고 있으므로,
  // 일부 shouldTopUp과 isTopUpAvailable만으로 버튼 비활성화 여부를 체크하게 되면
  // 현재 선택된 fee currency가 부족한 경우 버튼 비활성화 되지 않는 케이스가 발생하므로
  // 추가로 아래 조건을 추가하여 버튼 비활성화 여부를 체크하도록 함
  const isInsufficientFeeWarning =
    (isTopUpAvailable || feeConfig.topUpStatus.remainingTimeMs !== undefined) &&
    feeConfig.uiProperties.warning instanceof InsufficientFeeError;

  const [remainingTimeMs, setRemainingTimeMs] = useState<number>();

  const remainingText = (() => {
    if (remainingTimeMs === undefined) return undefined;
    const minutes = Math.floor(remainingTimeMs / 60000);
    const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
    return intl.formatMessage(
      { id: "components.top-up.wait-time" },
      {
        minutes: minutes.toString(),
        seconds: seconds.toString().padStart(2, "0"),
      }
    );
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
    if (!shouldTopUp) return;

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
  }, [shouldTopUp]);

  async function executeTopUpIfAvailable() {
    if (!shouldTopUp || isTopUpInProgress) {
      return;
    }

    setIsTopUpInProgress(true);
    try {
      const stdFee = feeConfig.toStdFee();
      const client = new TopUpClient();

      const topUpTxHash = await client.postTopUp({
        chainId: feeConfig.chainId,
        recipientAddress: senderConfig.sender,
        fee: stdFee,
      });

      const rpc = chainStore.getChain(feeConfig.chainId).rpc;
      const tracer = new TendermintTxTracer(rpc, "/websocket");

      try {
        await tracer.traceTx(Buffer.from(topUpTxHash, "hex") as Uint8Array);
      } finally {
        tracer.close();
      }

      setTopUpCompleted(true);

      queriesStore
        .get(feeConfig.chainId)
        .queryBalances.getQueryBech32Address(senderConfig.sender)
        .fetch();
    } catch (e) {
      console.error(e);

      const error = new Error(
        intl.formatMessage({
          id: "page.sign.cosmos.tx.top-up-error-message",
        })
      );

      setTopUpError(error);

      throw error;
    } finally {
      setIsTopUpInProgress(false);
    }
  }

  return {
    shouldTopUp,
    remainingText,
    isTopUpAvailable,
    isInsufficientFeeWarning,
    isTopUpInProgress,
    executeTopUpIfAvailable,
    topUpError,
  };
}
