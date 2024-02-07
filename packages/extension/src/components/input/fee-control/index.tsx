import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  ISenderConfig,
} from "@keplr-wallet/hooks";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";
import { Body2, Subtitle4 } from "../../typography";
import { LoadingIcon } from "../../icon";
import { Modal } from "../../modal";
import { TransactionFeeModal } from "./modal";
import { useStore } from "../../../stores";
import { autorun } from "mobx";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";
import { useIntl } from "react-intl";
import { XAxis, YAxis } from "../../axis";
import { Tag } from "../../tag";

export const FeeControl: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;

  disableAutomaticFeeSet?: boolean;
}> = observer(
  ({
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
  }) => {
    const {
      analyticsStore,
      queriesStore,
      priceStore,
      chainStore,
      uiConfigStore,
    } = useStore();

    const intl = useIntl();
    const theme = useTheme();

    useLayoutEffect(() => {
      if (disableAutomaticFeeSet) {
        return;
      }

      if (
        feeConfig.fees.length === 0 &&
        feeConfig.selectableFeeCurrencies.length > 0
      ) {
        if (
          uiConfigStore.rememberLastFeeOption &&
          uiConfigStore.lastFeeOption
        ) {
          feeConfig.setFee({
            type: uiConfigStore.lastFeeOption,
            currency: feeConfig.selectableFeeCurrencies[0],
          });
        } else {
          feeConfig.setFee({
            type: "average",
            currency: feeConfig.selectableFeeCurrencies[0],
          });
        }
      }
    }, [
      disableAutomaticFeeSet,
      feeConfig,
      feeConfig.fees,
      feeConfig.selectableFeeCurrencies,
      uiConfigStore.lastFeeOption,
      uiConfigStore.rememberLastFeeOption,
    ]);

    useLayoutEffect(() => {
      if (disableAutomaticFeeSet) {
        return;
      }

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
              chainStore
                .getChain(feeConfig.chainId)
                .hasFeature("osmosis-txfees");

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
      disableAutomaticFeeSet,
      feeConfig,
      feeConfig.chainId,
      queriesStore,
      senderConfig.sender,
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <Box>
        <YAxis alignX="center">
          <Box
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              analyticsStore.logEvent("click_txFeeSet");
              setIsModalOpen(true);
            }}
          >
            <XAxis alignY="center">
              {/* 밑의 박스는 오른쪽에 로딩 또는 현재 선택된 옵션에 대한 태그를 표시하기 위한 box와 양옆의 균형을 맞추기 위해서 존재함 */}
              <Box
                position="relative"
                marginLeft="0.25rem"
                minWidth="1.25rem"
              />
              <Body2
                color={(() => {
                  if (
                    feeConfig.uiProperties.error ||
                    feeConfig.uiProperties.warning
                  ) {
                    return theme.mode === "light"
                      ? ColorPalette["orange-400"]
                      : ColorPalette["yellow-400"];
                  }

                  return theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["white"];
                })()}
                style={{
                  textDecoration: "underline",
                }}
              >
                {`Fee: ${(() => {
                  if (feeConfig.fees.length > 0) {
                    return feeConfig.fees;
                  }
                  const chainInfo = chainStore.getChain(feeConfig.chainId);
                  return [
                    new CoinPretty(
                      chainInfo.stakeCurrency || chainInfo.currencies[0],
                      new Dec(0)
                    ),
                  ];
                })()
                  .map((fee) =>
                    fee
                      .maxDecimals(6)
                      .inequalitySymbol(true)
                      .trim(true)
                      .shrink(true)
                      .hideIBCMetadata(true)
                      .toString()
                  )
                  .join("+")}`}
              </Body2>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-300"]
                }
                style={{
                  textDecoration: "underline",
                  whiteSpace: "pre-wrap",
                }}
              >
                {` ${(() => {
                  let total: PricePretty | undefined;
                  let hasUnknown = false;
                  for (const fee of feeConfig.fees) {
                    if (!fee.currency.coinGeckoId) {
                      hasUnknown = true;
                      break;
                    } else {
                      const price = priceStore.calculatePrice(fee);
                      if (price) {
                        if (!total) {
                          total = price;
                        } else {
                          total = total.add(price);
                        }
                      }
                    }
                  }

                  if (hasUnknown || !total) {
                    return "";
                  }
                  return `(${total.toString()})`;
                })()}`}
              </Body2>
              <Box
                position="relative"
                marginLeft="0.25rem"
                minWidth="1.25rem"
                height="1px"
                alignY="center"
              >
                {(() => {
                  if (
                    feeConfig.uiProperties.loadingState ||
                    gasSimulator?.uiProperties.loadingState
                  ) {
                    return (
                      <Box alignY="center">
                        <LoadingIcon
                          width="1.25rem"
                          height="1.25rem"
                          color={ColorPalette["gray-200"]}
                        />
                      </Box>
                    );
                  }

                  if (feeConfig.type === "low" || feeConfig.type === "high") {
                    return (
                      <Box alignY="center">
                        <Tag
                          text={intl.formatMessage({
                            id: `components.input.fee-control.modal.fee-selector.${feeConfig.type}`,
                          })}
                        />
                      </Box>
                    );
                  }

                  return null;
                })()}
              </Box>
            </XAxis>
          </Box>
        </YAxis>
        <VerticalResizeTransition transitionAlign="top">
          {feeConfig.uiProperties.error || feeConfig.uiProperties.warning ? (
            <Box
              marginTop="1.25rem"
              borderRadius="0.5rem"
              alignX="center"
              alignY="center"
              paddingY="1.125rem"
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["orange-50"]
                  : ColorPalette["yellow-800"]
              }
            >
              <Subtitle4
                color={
                  theme.mode === "light"
                    ? ColorPalette["orange-400"]
                    : ColorPalette["yellow-400"]
                }
              >
                {(() => {
                  if (feeConfig.uiProperties.error) {
                    if (
                      feeConfig.uiProperties.error instanceof
                      InsufficientFeeError
                    ) {
                      return intl.formatMessage({
                        id: "components.input.fee-control.error.insufficient-fee",
                      });
                    }

                    return (
                      feeConfig.uiProperties.error.message ||
                      feeConfig.uiProperties.error.toString()
                    );
                  }

                  if (feeConfig.uiProperties.warning) {
                    return (
                      feeConfig.uiProperties.warning.message ||
                      feeConfig.uiProperties.warning.toString()
                    );
                  }

                  if (gasConfig.uiProperties.error) {
                    return (
                      gasConfig.uiProperties.error.message ||
                      gasConfig.uiProperties.error.toString()
                    );
                  }

                  if (gasConfig.uiProperties.warning) {
                    return (
                      gasConfig.uiProperties.warning.message ||
                      gasConfig.uiProperties.warning.toString()
                    );
                  }
                })()}
              </Subtitle4>
            </Box>
          ) : null}
        </VerticalResizeTransition>

        <Modal
          isOpen={isModalOpen}
          align="bottom"
          maxHeight="95vh"
          close={() => setIsModalOpen(false)}
        >
          <TransactionFeeModal
            close={() => setIsModalOpen(false)}
            senderConfig={senderConfig}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            gasSimulator={gasSimulator}
          />
        </Modal>
      </Box>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};
