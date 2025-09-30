import { FeeConfig } from "@keplr-wallet/hooks";
import { SenderConfig } from "@keplr-wallet/hooks";
import { IBaseAmountConfig } from "@keplr-wallet/hooks";
import { InsufficientFeeError } from "@keplr-wallet/hooks";
import { useStore } from "../stores";
import { Dec } from "@keplr-wallet/unit";

export function useShouldTopup({
  feeConfig,
  senderConfig,
  amountConfig,
}: {
  feeConfig: FeeConfig;
  senderConfig: SenderConfig;
  amountConfig: IBaseAmountConfig;
}): boolean {
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
        console.log("bal", bal.toString());
        console.log("totalNeed", totalNeed.toString());
        return false;
      }
    }

    return feeConfig.selectableFeeCurrencies.length > 0;
  })();

  return (
    "isTopUpAvailable" in feeConfig.topUpStatus &&
    (feeConfig.topUpStatus.isTopUpAvailable ||
      feeConfig.topUpStatus.remainingTimeMs !== undefined) &&
    (isOsmosis
      ? allFeeCurrenciesInsufficient
      : feeConfig.uiProperties.warning instanceof InsufficientFeeError)
  );
}
