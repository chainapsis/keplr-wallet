import { FeeConfig } from "@keplr-wallet/hooks";
import { SenderConfig } from "@keplr-wallet/hooks";
import { useStore } from "../stores";
import { useEffect, useState } from "react";
import { TopUpClient } from "@keplr-wallet/topup-client";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { useIntl } from "react-intl";

export interface TopUpParams {
  feeConfig: FeeConfig;
  senderConfig: SenderConfig;
  hasHardwareWalletError?: boolean;
}

export interface TopUpResult {
  shouldTopUp: boolean;
  remainingText: string | undefined;
  isTopUpAvailable: boolean;
  isTopUpInProgress: boolean;
  topUpCompleted: boolean;
  executeTopUpIfAvailable: () => Promise<void>;
  topUpError: Error | undefined;
}

export function useTopUp({
  feeConfig,
  senderConfig,
  hasHardwareWalletError,
}: TopUpParams): TopUpResult {
  const { chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const [isTopUpInProgress, setIsTopUpInProgress] = useState(false);
  const [topUpCompleted, setTopUpCompleted] = useState(false);
  const [topUpError, setTopUpError] = useState<Error | undefined>(undefined);

  const topupBaseURL = process.env["KEPLR_EXT_TOPUP_BASE_URL"] || "";
  const topupApiKey = process.env["KEPLR_EXT_TOPUP_API_KEY"] || "";
  const isTopupConfigured = !!(topupBaseURL.trim() && topupApiKey.trim());

  const shouldTopUp =
    isTopupConfigured && // 환경 변수가 설정되어 있어야 함
    !topUpCompleted &&
    !hasHardwareWalletError &&
    feeConfig.topUpStatus.shouldTopUp;

  const isTopUpAvailable =
    isTopupConfigured && feeConfig.topUpStatus.isTopUpAvailable;

  const [remainingTimeMs, setRemainingTimeMs] = useState<number>();

  const remainingText = (() => {
    if (remainingTimeMs === undefined) return undefined;

    const HOUR_MS = 60 * 60 * 1000;
    const MINUTE_MS = 60 * 1000;
    let time: string;

    if (remainingTimeMs >= HOUR_MS) {
      const hours = Math.floor(remainingTimeMs / HOUR_MS);
      const minutes = Math.floor((remainingTimeMs % HOUR_MS) / MINUTE_MS);
      time = `${hours.toString().padStart(2, "0")}h ${minutes
        .toString()
        .padStart(2, "0")}m`;
    } else {
      const minutes = Math.floor(remainingTimeMs / MINUTE_MS);
      const seconds = Math.floor((remainingTimeMs % MINUTE_MS) / 1000);
      time = `${minutes.toString().padStart(2, "0")}m ${seconds
        .toString()
        .padStart(2, "0")}s`;
    }

    return intl.formatMessage({ id: "components.top-up.wait-time" }, { time });
  })();

  useEffect(() => {
    const serverRemaining = feeConfig.topUpStatus.remainingTimeMs;

    setRemainingTimeMs((prev) => {
      if (serverRemaining === undefined) {
        return undefined;
      }
      if (prev === undefined) {
        return serverRemaining;
      }
      return Math.min(prev, serverRemaining);
    });
  }, [feeConfig.topUpStatus.remainingTimeMs]);

  useEffect(() => {
    if (remainingTimeMs === undefined || remainingTimeMs <= 0) return;

    const interval = setInterval(() => {
      setRemainingTimeMs((prev) => {
        if (prev === undefined) {
          clearInterval(interval);
          feeConfig.refreshTopUpStatus();
          return undefined;
        }
        if (prev <= 0) {
          clearInterval(interval);
          feeConfig.refreshTopUpStatus();
          return 0;
        }
        return Math.max(prev - 1000, 0);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTimeMs !== undefined && remainingTimeMs > 0]);

  async function executeTopUpIfAvailable() {
    if (!shouldTopUp || isTopUpInProgress) {
      return;
    }

    setIsTopUpInProgress(true);
    setTopUpError(undefined);

    try {
      const stdFee =
        feeConfig.topUpStatus.topUpOverrideStdFee ?? feeConfig.toStdFee();
      const client = new TopUpClient(
        process.env["KEPLR_EXT_TOPUP_BASE_URL"] || "",
        process.env["KEPLR_EXT_TOPUP_API_KEY"] || ""
      );

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

      // 마지막으로 query의 상태를 최신화한다.
      // (서명 이후 extension을 끄지 않고 바로 다시 tx를 시도할때 ui flickering 방지)
      feeConfig.refreshTopUpStatus();
    }
  }

  return {
    shouldTopUp,
    remainingText,
    isTopUpAvailable,
    isTopUpInProgress,
    topUpCompleted,
    executeTopUpIfAvailable,
    topUpError,
  };
}
