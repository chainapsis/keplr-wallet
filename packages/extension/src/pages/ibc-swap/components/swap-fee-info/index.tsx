import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  ISenderConfig,
} from "@keplr-wallet/hooks";
import { autorun } from "mobx";
import { Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../../../stores";
import { IBCSwapAmountConfig } from "../../../../hooks/ibc-swap";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis, YAxis } from "../../../../components/axis";
import { Body3, Caption2, Subtitle4 } from "../../../../components/typography";
import { Tooltip } from "../../../../components/tooltip";
import { LoadingIcon } from "../../../../components/icon";
import { TransactionFeeModal } from "../../../../components/input/fee-control/modal";
import { Modal } from "../../../../components/modal";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";

export const SwapFeeInfo: FunctionComponent<{
  senderConfig: ISenderConfig;
  amountConfig: IBCSwapAmountConfig;
  gasConfig: IGasConfig;
  feeConfig: IFeeConfig;
  gasSimulator: IGasSimulator;
}> = observer(
  ({ senderConfig, amountConfig, gasConfig, feeConfig, gasSimulator }) => {
    const { queriesStore, chainStore, priceStore } = useStore();

    const theme = useTheme();

    useLayoutEffect(() => {
      // Require to invoke effect whenever chain is changed,
      // even though it is not used in logic.
      noop(feeConfig.chainId);

      // TODO: 이 로직은 FeeControl에서 가져온건데 다른 부분이 있음.
      //       기존 FeeControl은 실수로 인해서 fee를 자동으로 average로 설정하는 로직이
      //       체인이 바꼈을때는 작동하지 않음
      //       사실 기존 send page는 체인이 바뀌려면 select-asset page를 통해서만 가능했기 때문에
      //       이게 문제가 안됐는데 ibc-swap에서는 swtich in-out 등으로 인해서 체인이 동적으로 바뀔 수 있음
      //       이 문제 때문에 일단 땜빵으로 해결함
      //       이후에 FeeControl을 살펴보고 문제가 없는 방식을 찾아서 둘 다 수정하던가 해야함
      const selectableFeeCurrenciesMap = new Map<string, boolean>();
      for (const feeCurrency of feeConfig.selectableFeeCurrencies) {
        selectableFeeCurrenciesMap.set(feeCurrency.coinMinimalDenom, true);
      }

      if (
        feeConfig.selectableFeeCurrencies.length > 0 &&
        (feeConfig.fees.length === 0 ||
          feeConfig.fees.find(
            (fee) =>
              !selectableFeeCurrenciesMap.get(fee.currency.coinMinimalDenom)
          ) != null)
      ) {
        feeConfig.setFee({
          type: "average",
          currency: feeConfig.selectableFeeCurrencies[0],
        });
      }
    }, [
      feeConfig,
      feeConfig.chainId,
      feeConfig.fees,
      feeConfig.selectableFeeCurrencies,
    ]);

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
      feeConfig,
      feeConfig.chainId,
      queriesStore,
      senderConfig.sender,
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const intl = useIntl();

    const error = (() => {
      if (feeConfig.uiProperties.error) {
        if (feeConfig.uiProperties.error instanceof InsufficientFeeError) {
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
    })();

    return (
      <React.Fragment>
        <Box
          padding="1rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          style={{
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : undefined,
          }}
          borderRadius="0.375rem"
          borderWidth="1px"
          borderColor={
            error != null
              ? theme.mode === "light"
                ? ColorPalette["orange-400"]
                : ColorPalette["yellow-400"]
              : "transparent"
          }
        >
          {feeConfig.fees.length > 0 ? (
            <XAxis alignY="center">
              <Box
                cursor="pointer"
                onClick={(e) => {
                  e.preventDefault();

                  setIsModalOpen(true);
                }}
              >
                <Subtitle4
                  style={{
                    textDecoration: "underline",
                  }}
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-200"]
                  }
                >
                  <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.transaction-fee" />
                </Subtitle4>
              </Box>
              {feeConfig.uiProperties.loadingState ||
              gasSimulator.uiProperties.loadingState ? (
                <Box
                  height="1px"
                  alignX="center"
                  alignY="center"
                  marginLeft="0.2rem"
                >
                  {/* 로딩 아이콘이 부모의 height에 영향을 끼치지 않게 하기 위한 트릭 구조임 */}
                  <Box width="1rem" height="1rem">
                    <LoadingIcon
                      width="1rem"
                      height="1rem"
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-200"]
                          : ColorPalette["gray-300"]
                      }
                    />
                  </Box>
                </Box>
              ) : null}

              <div
                style={{
                  flex: 1,
                }}
              />

              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-300"]
                }
              >
                {(() => {
                  let totalPrice: PricePretty | undefined;
                  if (feeConfig.fees.length > 0) {
                    const fee = feeConfig.fees[0];
                    const price = priceStore.calculatePrice(fee);
                    if (price) {
                      if (totalPrice) {
                        totalPrice = totalPrice.add(price);
                      } else {
                        totalPrice = price;
                      }
                    } else {
                      return "-";
                    }
                  }

                  if (totalPrice) {
                    return totalPrice.toString();
                  }
                  return "-";
                })()}
              </Body3>

              <Gutter size="0.25rem" />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-600"]
                    : ColorPalette["gray-100"]
                }
              >
                =
              </Body3>
              <Gutter size="0.25rem" />
              <YAxis>
                {feeConfig.fees.map((fee) => {
                  return (
                    <Body3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-600"]
                          : ColorPalette["gray-100"]
                      }
                      key={fee.currency.coinMinimalDenom}
                    >
                      {fee
                        .maxDecimals(6)
                        .trim(true)
                        .shrink(true)
                        .inequalitySymbol(true)
                        .hideIBCMetadata(true)
                        .toString()}
                    </Body3>
                  );
                })}
              </YAxis>
            </XAxis>
          ) : null}

          <Gutter size="0.62rem" />

          <XAxis alignY="center">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["blue-400"]
                  : ColorPalette["blue-200"]
              }
            >
              <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.service-fee" />
            </Subtitle4>
            <Gutter size="0.2rem" />
            <Tooltip
              content={intl.formatMessage(
                {
                  id: "page.ibc-swap.components.swap-fee-info.button.service-fee.paragraph",
                },
                {
                  rate: (() => {
                    const feeRatioPretty = new IntPretty(
                      amountConfig.swapFeeBps
                    ).moveDecimalPointLeft(2);
                    return feeRatioPretty
                      .trim(true)
                      .maxDecimals(4)
                      .inequalitySymbol(true)
                      .toString();
                  })(),
                }
              )}
            >
              <InfoIcon
                width="1rem"
                height="1rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["blue-200"]
                }
              />
            </Tooltip>
            {amountConfig.isFetching ? (
              <Box
                height="1px"
                alignX="center"
                alignY="center"
                marginLeft="0.2rem"
              >
                {/* 로딩 아이콘이 부모의 height에 영향을 끼치지 않게 하기 위한 트릭 구조임 */}
                <Box width="1rem" height="1rem">
                  <LoadingIcon
                    width="1rem"
                    height="1rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                  />
                </Box>
              </Box>
            ) : null}

            <div style={{ flex: 1 }} />

            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-300"]
              }
            >
              {amountConfig.swapFee
                .map((fee) =>
                  fee
                    .maxDecimals(6)
                    .trim(true)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .hideIBCMetadata(true)
                    .toString()
                )
                .join(", ")}
            </Subtitle4>
          </XAxis>

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
        </Box>

        {error != null ? (
          <React.Fragment>
            <Gutter size="0.25rem" />
            <Box marginLeft="0.25rem">
              <Caption2
                color={
                  theme.mode === "light"
                    ? ColorPalette["orange-400"]
                    : ColorPalette["yellow-400"]
                }
              >
                {error}
              </Caption2>
            </Box>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }
);

const InfoIcon: FunctionComponent<{
  width: string;
  height: string;
  color: string;
}> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 16 16"
    >
      <path
        fill={color || "currentColor"}
        d="M8 1.333A6.67 6.67 0 001.333 8 6.669 6.669 0 008 14.667 6.67 6.67 0 0014.667 8 6.67 6.67 0 008 1.333zm.667 10H7.333v-4h1.334v4zm0-5.333H7.333V4.667h1.334V6z"
      />
    </svg>
  );
};

const noop = (..._args: any[]) => {
  // noop
};
