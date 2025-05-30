import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  InsufficientFeeError,
  ISenderConfig,
} from "@keplr-wallet/hooks-starknet";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../../styles";
import {
  Body2,
  Caption1,
  Subtitle4,
} from "../../../../../components/typography";
import { LoadingIcon } from "../../../../../components/icon";
import { Modal } from "../../../../../components/modal";
import { TransactionFeeModal } from "./modal";
import { useStore } from "../../../../../stores";
import { Box } from "../../../../../components/box";
import { VerticalResizeTransition } from "../../../../../components/transition";
import { FormattedMessage, useIntl } from "react-intl";
import { XAxis, YAxis } from "../../../../../components/axis";
import { UIConfigStore } from "../../../../../stores/ui-config";
import { IChainStore } from "@keplr-wallet/stores";
import { Tooltip } from "../../../../../components/tooltip";
import { autorun } from "mobx";
import { StarknetQueriesStore } from "@keplr-wallet/stores-starknet";
import { Dec } from "@keplr-wallet/unit";

// 기본적으로 `FeeControl` 안에 있는 로직이였지만 `FeeControl` 말고도 다른 UI를 가진 똑같은 기능의 component가
// 여러개 생기게 되면서 공통적으로 사용하기 위해서 custom hook으로 분리함
export const useFeeOptionSelectionOnInit = (
  _uiConfigStore: UIConfigStore,
  _feeConfig: IFeeConfig,
  _disableAutomaticFeeSet: boolean | undefined
) => {
  // TODO
  // useLayoutEffect(() => {
  //   if (disableAutomaticFeeSet) {
  //     return;
  //   }
  //
  //   if (
  //     feeConfig.fees.length === 0 &&
  //     feeConfig.selectableFeeCurrencies.length > 0
  //   ) {
  //     if (uiConfigStore.rememberLastFeeOption && uiConfigStore.lastFeeOption) {
  //       feeConfig.setFee({
  //         type: uiConfigStore.lastFeeOption,
  //         currency: feeConfig.selectableFeeCurrencies[0],
  //       });
  //     } else {
  //       feeConfig.setFee({
  //         type: "average",
  //         currency: feeConfig.selectableFeeCurrencies[0],
  //       });
  //     }
  //   }
  // }, [
  //   disableAutomaticFeeSet,
  //   feeConfig,
  //   feeConfig.fees,
  //   feeConfig.selectableFeeCurrencies,
  //   uiConfigStore.lastFeeOption,
  //   uiConfigStore.rememberLastFeeOption,
  // ]);
};

export const useAutoFeeCurrencySelectionOnInit = (
  chainStore: IChainStore,
  starknetQueriesStore: StarknetQueriesStore,
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
      const modularChainInfo = chainStore.getModularChain(feeConfig.chainId);
      if (!skip && "starknet" in modularChainInfo) {
        const queryBalances = starknetQueriesStore.get(
          feeConfig.chainId
        ).queryStarknetERC20Balance;

        const strkCoinMinmalDenom = `erc20:${modularChainInfo.starknet.strkContractAddress}`;
        const ethCoinMinmalDenom = `erc20:${modularChainInfo.starknet.ethContractAddress}`;

        for (const coinMinimalDenom of [
          strkCoinMinmalDenom,
          ethCoinMinmalDenom,
        ]) {
          const feeCurrencyBal = queryBalances.getBalance(
            feeConfig.chainId,
            chainStore,
            senderConfig.sender,
            coinMinimalDenom
          )?.balance;

          if (!feeCurrencyBal) {
            return;
          }

          if (feeCurrencyBal.toDec().gt(new Dec(0))) {
            feeConfig.setType(
              feeCurrencyBal.currency.coinDenom as "ETH" | "STRK"
            );
            const uiProperties = feeConfig.uiProperties;
            skip =
              !uiProperties.loadingState &&
              uiProperties.error == null &&
              uiProperties.warning == null;
            return;
          }

          continue;
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
    senderConfig.sender,
    starknetQueriesStore,
  ]);
};

export const FeeControl: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;

  disableAutomaticFeeSet?: boolean;
  disableClick?: boolean;
}> = observer(
  ({
    senderConfig,
    feeConfig,
    gasConfig,
    gasSimulator,
    disableAutomaticFeeSet,
    disableClick,
  }) => {
    const {
      analyticsStore,
      starknetQueriesStore,
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
      starknetQueriesStore,
      senderConfig,
      feeConfig,
      disableAutomaticFeeSet
    );

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <Box>
        <YAxis alignX="center">
          <Box
            /* text underline의 offset을 수동으로 설정했기 때문에 그만큼 paddnig bottom을 넣어줘야 paret가 overflow: hidden이여도 밑줄이 보임 */
            paddingBottom="0.21rem"
            cursor={disableClick ? undefined : "pointer"}
            onClick={(e) => {
              if (disableClick) {
                return;
              }
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
                  ...(!disableClick && {
                    textDecoration: "underline",
                    textUnderlineOffset: "0.2rem",
                  }),
                }}
              >
                {
                  <FormattedMessage
                    id="components.input.fee-control.fee"
                    values={{
                      assets: (() => {
                        if (!feeConfig.fee) {
                          return "-";
                        }

                        return feeConfig.fee
                          .maxDecimals(6)
                          .inequalitySymbol(true)
                          .trim(true)
                          .shrink(true)
                          .hideIBCMetadata(true)
                          .toString();
                      })(),
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
                  whiteSpace: "pre-wrap",
                  ...(!disableClick && {
                    textDecoration: "underline",
                    textUnderlineOffset: "0.2rem",
                  }),
                }}
              >
                {` ${(() => {
                  if (!feeConfig.fee) {
                    return "";
                  }
                  if (!feeConfig.fee.currency.coinGeckoId) {
                    return "";
                  }
                  return `(${(() => {
                    return priceStore.calculatePrice(feeConfig.fee);
                  })()})`;
                })()}`}
              </Body2>
              <Box minWidth="0.875rem" height="1px" alignY="center">
                {(() => {
                  if (
                    (feeConfig.uiProperties.loadingState &&
                      feeConfig.uiProperties.error?.message !==
                        "Fee is not set") ||
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
          <Box
            marginTop="0.375rem"
            padding="0.125rem 0.25rem"
            backgroundColor={(() => {
              return theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-500"];
            })()}
            borderRadius="0.5rem"
          >
            <XAxis alignY="center">
              <Caption1
                color={(() => {
                  if (
                    feeConfig.uiProperties.error ||
                    feeConfig.uiProperties.warning
                  ) {
                    return theme.mode === "light"
                      ? ColorPalette["orange-300"]
                      : ColorPalette["yellow-300"];
                  }

                  return theme.mode === "light"
                    ? ColorPalette["blue-300"]
                    : ColorPalette["gray-300"];
                })()}
              >
                <FormattedMessage
                  id="components.input.fee-control.max-fee"
                  values={{
                    assets: (() => {
                      if (!feeConfig.maxFee) {
                        return "-";
                      }

                      return feeConfig.maxFee
                        .maxDecimals(6)
                        .inequalitySymbol(true)
                        .trim(true)
                        .shrink(true)
                        .hideIBCMetadata(true)
                        .toString();
                    })(),
                  }}
                />
              </Caption1>
              <Caption1
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-300"]
                }
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {` ${(() => {
                  if (!feeConfig.maxFee) {
                    return "";
                  }
                  if (!feeConfig.maxFee.currency.coinGeckoId) {
                    return "";
                  }
                  return `(${(() => {
                    return priceStore.calculatePrice(feeConfig.maxFee);
                  })()})`;
                })()}`}
              </Caption1>
            </XAxis>
          </Box>
        </YAxis>
        <VerticalResizeTransition transitionAlign="top">
          {(feeConfig.uiProperties.error &&
            feeConfig.uiProperties.error.message !== "Fee is not set") ||
          feeConfig.uiProperties.warning ? (
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
          forceNotUseSimplebar={true}
          forceNotOverflowAuto={true}
        >
          <TransactionFeeModal
            close={() => setIsModalOpen(false)}
            senderConfig={senderConfig}
            feeConfig={feeConfig}
            gasSimulator={gasSimulator}
            disableAutomaticFeeSet={disableAutomaticFeeSet}
          />
        </Modal>
      </Box>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};
