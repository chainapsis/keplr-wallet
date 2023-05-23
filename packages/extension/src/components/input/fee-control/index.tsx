import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  ISenderConfig,
} from "@keplr-wallet/hooks";
import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import { Column, Columns } from "../../column";
import { Caption1, Subtitle3, Subtitle4 } from "../../typography";
import { ArrowRightIcon, LoadingIcon, SettingIcon } from "../../icon";
import { Stack } from "../../stack";
import { Modal } from "../../modal";
import { TransactionFeeModal } from "./modal";
import { useStore } from "../../../stores";
import { autorun } from "mobx";
import { PricePretty } from "@keplr-wallet/unit";
import { Gutter } from "../../gutter";
import Color from "color";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";

const Styles = {
  Container: styled.div<{
    hasError: boolean;
  }>`
    padding: 0.875rem 0.25rem 0.875rem 1rem;
    background-color: ${ColorPalette["gray-600"]};

    border: ${({ hasError }) =>
      hasError
        ? `1.5px solid ${Color(ColorPalette["yellow-400"])
            .alpha(0.5)
            .toString()}`
        : `1.5px solid ${Color(ColorPalette["blue-400"])
            .alpha(0.5)
            .toString()}`};
    border-radius: 0.375rem;

    :hover {
      border: ${({ hasError }) =>
        hasError
          ? `1.5px solid ${ColorPalette["yellow-500"]}`
          : `1.5px solid ${ColorPalette["blue-500"]};`};
    }

    cursor: pointer;
  `,
  IconContainer: styled.div`
    color: ${ColorPalette["gray-300"]};
  `,
};

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
    const { queriesStore, priceStore } = useStore();

    useLayoutEffect(() => {
      if (disableAutomaticFeeSet) {
        return;
      }

      if (
        feeConfig.fees.length === 0 &&
        feeConfig.selectableFeeCurrencies.length > 0
      ) {
        feeConfig.setFee({
          type: "average",
          currency: feeConfig.selectableFeeCurrencies[0],
        });
      }
    }, [
      disableAutomaticFeeSet,
      feeConfig,
      feeConfig.fees,
      feeConfig.selectableFeeCurrencies,
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
            // Not enough balances for fee.
            // Try to find other fee currency to send.
            for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
              const feeCurrencyBal =
                queryBalances.getBalanceFromCurrency(feeCurrency);
              const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
                feeCurrency,
                feeConfig.type
              );

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
      disableAutomaticFeeSet,
      feeConfig,
      feeConfig.chainId,
      queriesStore,
      senderConfig.sender,
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <React.Fragment>
        <Styles.Container
          hasError={
            feeConfig.uiProperties.error != null ||
            gasConfig.uiProperties.error != null
          }
          onClick={() => setIsModalOpen(true)}
        >
          <Columns sum={1} alignY="center">
            <Columns sum={1} alignY="center">
              <Subtitle4>Transaction Fee</Subtitle4>
              <Gutter size="0.25rem" />
              {feeConfig.uiProperties.loadingState ||
              gasSimulator?.uiProperties.loadingState ? (
                <LoadingIcon width="1rem" height="1rem" />
              ) : (
                <SettingIcon width="1rem" height="1rem" />
              )}
            </Columns>

            <Column weight={1} />

            <Columns sum={1} gutter="0.25rem" alignY="center">
              <Stack gutter="0.25rem" alignX="right">
                <Subtitle3>
                  {feeConfig.fees
                    .map((fee) => {
                      return fee
                        .maxDecimals(6)
                        .inequalitySymbol(true)
                        .trim(true)
                        .shrink(true)
                        .hideIBCMetadata(true)
                        .toString();
                    })
                    .join(",")}
                </Subtitle3>
                <Subtitle3 style={{ color: ColorPalette["gray-300"] }}>
                  {(() => {
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
                      return "-";
                    }
                    return total.toString();
                  })()}
                </Subtitle3>
              </Stack>

              <Styles.IconContainer>
                <ArrowRightIcon />
              </Styles.IconContainer>
            </Columns>
          </Columns>

          <Modal
            isOpen={isModalOpen}
            align="bottom"
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
        </Styles.Container>

        <VerticalResizeTransition transitionAlign="top">
          {feeConfig.uiProperties.error || feeConfig.uiProperties.warning ? (
            <Box marginTop="4px">
              <Caption1 color={ColorPalette["yellow-400"]}>
                {(() => {
                  if (feeConfig.uiProperties.error) {
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
              </Caption1>
            </Box>
          ) : null}
        </VerticalResizeTransition>
      </React.Fragment>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};
