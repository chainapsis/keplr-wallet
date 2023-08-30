import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
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
import { Body3, Subtitle4 } from "../../../../components/typography";
import { Tooltip } from "../../../../components/tooltip";
import { LoadingIcon } from "../../../../components/icon";
import { TransactionFeeModal } from "../../../../components/input/fee-control/modal";
import { Modal } from "../../../../components/modal";

export const SwapFeeInfo: FunctionComponent<{
  senderConfig: ISenderConfig;
  amountConfig: IBCSwapAmountConfig;
  gasConfig: IGasConfig;
  feeConfig: IFeeConfig;
  gasSimulator: IGasSimulator;
}> = observer(
  ({ senderConfig, amountConfig, gasConfig, feeConfig, gasSimulator }) => {
    const { queriesStore, chainStore, priceStore } = useStore();

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

    return (
      <Box
        padding="1rem"
        backgroundColor={ColorPalette["gray-600"]}
        borderRadius="0.375rem"
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
                color={ColorPalette["gray-200"]}
              >
                Transaction Fee
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
                    color={ColorPalette["gray-100"]}
                  />
                </Box>
              </Box>
            ) : null}

            <div
              style={{
                flex: 1,
              }}
            />

            <Body3>
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
            <Body3 color={ColorPalette["gray-100"]}>=</Body3>
            <Gutter size="0.25rem" />
            <YAxis>
              {feeConfig.fees.map((fee) => {
                return (
                  <Body3
                    color={ColorPalette["gray-100"]}
                    key={fee.currency.coinMinimalDenom}
                  >
                    {fee
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)
                      .inequalitySymbol(true)
                      .toString()}
                  </Body3>
                );
              })}
            </YAxis>
          </XAxis>
        ) : null}

        <Gutter size="0.62rem" />

        <XAxis alignY="center">
          <Subtitle4 color={ColorPalette["gray-300"]}>Keplr Swap Fee</Subtitle4>
          <Gutter size="0.2rem" />
          <Tooltip
            content={`TODO: ${(() => {
              const feeRatioPretty = new IntPretty(
                amountConfig.swapFeeBps
              ).moveDecimalPointLeft(2);
              return feeRatioPretty
                .trim(true)
                .maxDecimals(4)
                .inequalitySymbol(true)
                .toString();
            })()}%`}
          >
            <InfoIcon
              width="1rem"
              height="1rem"
              color={ColorPalette["gray-400"]}
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
                  color={ColorPalette["gray-100"]}
                />
              </Box>
            </Box>
          ) : null}

          <div style={{ flex: 1 }} />

          <Subtitle4 color={ColorPalette["gray-300"]}>
            {amountConfig.swapFee
              .map((fee) =>
                fee
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .inequalitySymbol(true)
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
