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
import { FormattedMessage, useIntl } from "react-intl";
import { XAxis, YAxis } from "../../axis";
import { UIConfigStore } from "../../../stores/ui-config";
import { IChainStore, IQueriesStore } from "@keplr-wallet/stores";
import { Tooltip } from "../../tooltip";
import { EthereumAccountBase } from "@keplr-wallet/stores-eth";

// 기본적으로 `FeeControl` 안에 있는 로직이였지만 `FeeControl` 말고도 다른 UI를 가진 똑같은 기능의 component가
// 여러개 생기게 되면서 공통적으로 사용하기 위해서 custom hook으로 분리함
export const useFeeOptionSelectionOnInit = (
  uiConfigStore: UIConfigStore,
  feeConfig: IFeeConfig,
  disableAutomaticFeeSet: boolean | undefined
) => {
  useLayoutEffect(() => {
    if (disableAutomaticFeeSet) {
      return;
    }

    if (
      feeConfig.fees.length === 0 &&
      feeConfig.selectableFeeCurrencies.length > 0
    ) {
      if (uiConfigStore.rememberLastFeeOption && uiConfigStore.lastFeeOption) {
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
};

export const useAutoFeeCurrencySelectionOnInit = (
  chainStore: IChainStore,
  queriesStore: IQueriesStore,
  senderConfig: ISenderConfig,
  feeConfig: IFeeConfig,
  disableAutomaticFeeSet: boolean | undefined
) => {
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
    }, 2000);

    const disposer = autorun(() => {
      if (
        !skip &&
        feeConfig.type !== "manual" &&
        feeConfig.selectableFeeCurrencies.length > 1 &&
        feeConfig.fees.length > 0
      ) {
        const queryBalances =
          chainStore.getChain(feeConfig.chainId).evm != null &&
          EthereumAccountBase.isEthereumHexAddressWithChecksum(
            senderConfig.sender
          )
            ? queriesStore
                .get(feeConfig.chainId)
                .queryBalances.getQueryEthereumHexAddress(senderConfig.sender)
            : queriesStore
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
    disableAutomaticFeeSet,
    feeConfig,
    feeConfig.chainId,
    queriesStore,
    senderConfig.sender,
  ]);
};

export const FeeControl: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;

  disableAutomaticFeeSet?: boolean;
  isForEVMTx?: boolean;
}> = observer(
  ({
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
    isForEVMTx,
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

    useFeeOptionSelectionOnInit(
      uiConfigStore,
      feeConfig,
      disableAutomaticFeeSet
    );

    useAutoFeeCurrencySelectionOnInit(
      chainStore,
      queriesStore,
      senderConfig,
      feeConfig,
      disableAutomaticFeeSet
    );

    const [isModalOpen, setIsModalOpen] = useState(false);

    // EVM 트랜잭션의 경우, 외부에서 fee를 설정한 경우를 구분하기 위해서 사용
    const isFeeSetByUser = isForEVMTx && feeConfig.type !== "manual";

    // gasAdjustment와 gasEstimated를 사용해 계산된 값을 보여주는 경우
    const isShowingFeeWithGasEstimated =
      !!gasSimulator?.enabled && !!gasSimulator?.gasEstimated && isFeeSetByUser;

    return (
      <Box>
        <YAxis alignX="center">
          <Box
            /* text underline의 offset을 수동으로 설정했기 때문에 그만큼 paddnig bottom을 넣어줘야 paret가 overflow: hidden이여도 밑줄이 보임 */
            paddingBottom="0.21rem"
            cursor="pointer"
            onClick={(e) => {
              e.preventDefault();

              analyticsStore.logEvent("click_txFeeSet");
              setIsModalOpen(true);
            }}
          >
            <XAxis alignY="center">
              {/* 밑의 박스는 현재 기억된 fee 옵션을 사용하기 옵션이 on되어있다는 표시하기 위한 box와 양옆의 균형을 맞추기 위해서 존재함 */}
              <Box minWidth="0.875rem" />
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
                  textUnderlineOffset: "0.2rem",
                }}
              >
                {
                  <FormattedMessage
                    id="components.input.fee-control.fee"
                    values={{
                      assets: (() => {
                        if (feeConfig.fees.length > 0) {
                          return feeConfig.fees;
                        }
                        const chainInfo = chainStore.getChain(
                          feeConfig.chainId
                        );
                        return [
                          new CoinPretty(
                            chainInfo.stakeCurrency || chainInfo.currencies[0],
                            new Dec(0)
                          ),
                        ];
                      })()
                        .map((fee) =>
                          fee
                            .sub(
                              new Dec(feeConfig.l1DataFee?.toString() || "0")
                            )
                            .quo(
                              new Dec(
                                isShowingFeeWithGasEstimated
                                  ? gasConfig?.gas || 1
                                  : 1
                              )
                            )
                            .mul(
                              new Dec(
                                isShowingFeeWithGasEstimated
                                  ? gasSimulator?.gasEstimated || 1
                                  : 1
                              )
                            )
                            .mul(
                              new Dec(
                                isShowingFeeWithGasEstimated
                                  ? gasSimulator?.gasAdjustment || 1
                                  : 1
                              )
                            )
                            .add(
                              new Dec(feeConfig.l1DataFee?.toString() || "0")
                            )
                            .add(
                              isFeeSetByUser
                                ? new Dec(0)
                                : new Dec(
                                    feeConfig.l1DataFee?.toString() || "0"
                                  ) // evm fee가 외부에서 설정된 경우, fee = gasLimit * gasPrice이므로 l1DataFee를 더해줘야 함
                            )
                            .maxDecimals(6)
                            .inequalitySymbol(true)
                            .trim(true)
                            .shrink(true)
                            .hideIBCMetadata(true)
                            .toString()
                        )
                        .join("+"),
                    }}
                  />
                }
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
                  textUnderlineOffset: "0.2rem",
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
                      const price = priceStore.calculatePrice(
                        fee
                          .sub(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                          .quo(
                            new Dec(
                              isShowingFeeWithGasEstimated
                                ? gasConfig?.gas || 1
                                : 1
                            )
                          )
                          .mul(
                            new Dec(
                              isShowingFeeWithGasEstimated
                                ? gasSimulator?.gasEstimated || 1
                                : 1
                            )
                          )
                          .mul(
                            new Dec(
                              isShowingFeeWithGasEstimated
                                ? gasSimulator?.gasAdjustment || 1
                                : 1
                            )
                          )
                          .add(new Dec(feeConfig.l1DataFee?.toString() || "0"))
                          .add(
                            isFeeSetByUser
                              ? new Dec(0)
                              : new Dec(feeConfig.l1DataFee?.toString() || "0")
                          )
                      );
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
              <Box minWidth="0.875rem" height="1px" alignY="center">
                {(() => {
                  if (
                    feeConfig.uiProperties.loadingState ||
                    gasSimulator?.uiProperties.loadingState
                  ) {
                    return (
                      <Box alignY="center" marginLeft="0.25rem">
                        <LoadingIcon
                          width="1.25rem"
                          height="1.25rem"
                          color={ColorPalette["gray-200"]}
                        />
                      </Box>
                    );
                  }

                  if (
                    !disableAutomaticFeeSet &&
                    uiConfigStore.rememberLastFeeOption
                  ) {
                    return (
                      <Box minWidth="0.875rem" alignY="center" alignX="center">
                        <div
                          style={{
                            width: "0.375rem",
                            height: "0.375rem",
                            borderRadius: "99999px",
                            backgroundColor:
                              theme.mode === "light"
                                ? ColorPalette["blue-400"]
                                : ColorPalette["blue-400"],
                          }}
                        />
                      </Box>
                    );
                  }

                  if (disableAutomaticFeeSet) {
                    return (
                      <Tooltip
                        content={intl.formatMessage({
                          id: "components.input.fee-control.tooltip.external-fee-set",
                        })}
                      >
                        <Box alignY="center" marginLeft="0.25rem">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="17"
                            height="17"
                            fill="none"
                            viewBox="0 0 17 17"
                          >
                            <path
                              fill={
                                theme.mode === "light"
                                  ? ColorPalette["gray-200"]
                                  : ColorPalette["gray-300"]
                              }
                              d="M8.5 1.833A6.67 6.67 0 001.833 8.5 6.67 6.67 0 008.5 15.167 6.67 6.67 0 0015.167 8.5 6.67 6.67 0 008.5 1.833zm.667 10H7.834v-4h1.333v4zm0-5.333H7.834V5.167h1.333V6.5z"
                            />
                          </svg>
                        </Box>
                      </Tooltip>
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
              marginTop="1.04rem"
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
            disableAutomaticFeeSet={disableAutomaticFeeSet}
            isForEVMTx={isForEVMTx}
          />
        </Modal>
      </Box>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};
