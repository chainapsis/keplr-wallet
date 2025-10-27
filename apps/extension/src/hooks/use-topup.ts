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
          feeConfig.refreshTopUpStatus();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [remainingTimeMs, feeConfig]);

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
    }
  }

  return {
    shouldTopUp,
    remainingText,
    isTopUpAvailable,
    isTopUpInProgress,
    executeTopUpIfAvailable,
    topUpError,
  };
}
