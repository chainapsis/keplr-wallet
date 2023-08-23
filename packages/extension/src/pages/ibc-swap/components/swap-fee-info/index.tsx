import React, { FunctionComponent, useLayoutEffect } from "react";
import { observer } from "mobx-react-lite";
import { IFeeConfig, ISenderConfig } from "@keplr-wallet/hooks";
import { autorun } from "mobx";
import { Dec } from "@keplr-wallet/unit";
import { useStore } from "../../../../stores";

export const SwapFeeInfo: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
}> = observer(({ senderConfig, feeConfig }) => {
  const { queriesStore, chainStore } = useStore();

  useLayoutEffect(() => {
    if (
      feeConfig.fees.length === 0 &&
      feeConfig.selectableFeeCurrencies.length > 0
    ) {
      feeConfig.setFee({
        type: "average",
        currency: feeConfig.selectableFeeCurrencies[0],
      });
    }
  }, [feeConfig, feeConfig.fees, feeConfig.selectableFeeCurrencies]);

  useLayoutEffect(() => {
    // Require to invoke effect whenever chain is changed,
    // even though it is not used in logic.
    noop(feeConfig.chainId);

    // Try to find other fee currency if the account doesn't have enough fee to pay.
    // This logic can be slightly complex, so use mobx's `autorun`.
    // This part fairly different with the approach of react's hook.
    let skip = false;
    // Try until 500ms to avoid the confusion to user.
    const timeoutId = setTimeout(() => {
      skip = true;
    }, 500);

    const disposer = autorun(() => {
      if (
        !skip &&
        feeConfig.type !== "manual" &&
        feeConfig.selectableFeeCurrencies.length > 1 &&
        feeConfig.fees.length > 0
      ) {
        const queryBalances = queriesStore
          .get(feeConfig.chainId)
          .queryBalances.getQueryBech32Address(senderConfig.sender);

        const currentFeeCurrency = feeConfig.fees[0].currency;
        const currentFeeCurrencyBal =
          queryBalances.getBalanceFromCurrency(currentFeeCurrency);

        const currentFee = feeConfig.getFeeTypePrettyForFeeCurrency(
          currentFeeCurrency,
          feeConfig.type
        );
        if (currentFeeCurrencyBal.toDec().lt(currentFee.toDec())) {
          const isOsmosis =
            chainStore.hasChain(feeConfig.chainId) &&
            chainStore.getChain(feeConfig.chainId).hasFeature("osmosis-txfees");

          // Not enough balances for fee.
          // Try to find other fee currency to send.
          for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
            const feeCurrencyBal =
              queryBalances.getBalanceFromCurrency(feeCurrency);
            const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
              feeCurrency,
              feeConfig.type
            );

            // Osmosis의 경우는 fee의 spot price를 알아야 fee를 계산할 수 있다.
            // 그런데 문제는 이게 쿼리가 필요하기 때문에 비동기적이라 response를 기다려야한다.
            // 어쨋든 스왑에 의해서만 fee 계산이 이루어지기 때문에 fee로 Osmo가 0이였다면 이 로직까지 왔을리가 없고
            // 어떤 갯수의 Osmo던지 스왑 이후에 fee가 0이 될수는 없기 때문에
            // 0라면 단순히 response 준비가 안된것이라 확신할 수 있다.
            if (isOsmosis && fee.toDec().lte(new Dec(0))) {
              continue;
            }

            if (feeCurrencyBal.toDec().gte(fee.toDec())) {
              feeConfig.setFee({
                type: feeConfig.type,
                currency: feeCurrency,
              });
              const uiProperties = feeConfig.uiProperties;
              skip =
                !uiProperties.loadingState &&
                uiProperties.error == null &&
                uiProperties.warning == null;
              return;
            }
          }
        }
      }
    });

    return () => {
      clearTimeout(timeoutId);
      skip = true;
      disposer();
    };
  }, [
    chainStore,
    feeConfig,
    feeConfig.chainId,
    queriesStore,
    senderConfig.sender,
  ]);

  return <div>{feeConfig.fees.map((fee) => fee.toString()).join(", ")}</div>;
});

const noop = (..._args: any[]) => {
  // noop
};
