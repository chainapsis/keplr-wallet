import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
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
import { SwapAmountConfig } from "@keplr-wallet/hooks-internal";
import { SwapProvider } from "@keplr-wallet/stores-internal";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis, YAxis } from "../../../../components/axis";
import { Subtitle3 } from "../../../../components/typography";
import { LoadingIcon, AdjustmentIcon } from "../../../../components/icon";
import { TransactionFeeModal } from "../../../../components/input/fee-control/modal";
import { Modal } from "../../../../components/modal";
import { FormattedMessage } from "react-intl";
import { useTheme } from "styled-components";
import { getTitleColor } from "../../../../components/guide-box";

export const SwapFeeInfo: FunctionComponent<{
  senderConfig: ISenderConfig;
  amountConfig: SwapAmountConfig;
  gasConfig: IGasConfig;
  feeConfig: IFeeConfig;
  gasSimulator: IGasSimulator;
  disableAutomaticFeeSet?: boolean;
  isForEVMTx?: boolean;
  nonceMethod?: "pending" | "latest";
  setNonceMethod?: (nonceMethod: "pending" | "latest") => void;
  shouldTopUp?: boolean;
}> = observer(
  ({
    senderConfig,
    amountConfig,
    gasConfig,
    feeConfig,
    gasSimulator,
    disableAutomaticFeeSet,
    isForEVMTx,
    nonceMethod,
    setNonceMethod,
    shouldTopUp,
  }) => {
    const { queriesStore, chainStore, priceStore, uiConfigStore } = useStore();

    const theme = useTheme();

    useLayoutEffect(() => {
      if (disableAutomaticFeeSet) {
        return;
      }
      const disposer = autorun(() => {
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
      });

      return () => {
        disposer();
      };
    }, [feeConfig, uiConfigStore, disableAutomaticFeeSet]);

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
      feeConfig,
      feeConfig.chainId,
      queriesStore,
      senderConfig.sender,
      disableAutomaticFeeSet,
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      if (shouldTopUp) {
        setIsModalOpen(false);
      }
    }, [shouldTopUp]);

    const isShowingEstimatedFee = isForEVMTx && !!gasSimulator.gasEstimated;

    const txFeeColor = (() => {
      const hasError = !!feeConfig.uiProperties.error;
      const isLightTheme = theme.mode === "light";

      if (!isLightTheme && !hasError && !isHovered)
        return ColorPalette["gray-200"];
      if (!isLightTheme && !hasError && isHovered)
        return ColorPalette["gray-300"];
      if (!isLightTheme && hasError && !isHovered)
        return getTitleColor(theme, "warning");
      if (!isLightTheme && hasError && isHovered)
        return ColorPalette["yellow-600"];
      if (isLightTheme && !hasError && !isHovered)
        return ColorPalette["gray-300"];
      if (isLightTheme && !hasError && isHovered)
        return ColorPalette["gray-200"];
      if (isLightTheme && hasError && !isHovered)
        return getTitleColor(theme, "warning");
      if (isLightTheme && hasError && isHovered)
        return ColorPalette["orange-200"];
    })();

    return (
      <React.Fragment>
        <Box paddingX="0.5rem" paddingY="0.25rem">
          {feeConfig.fees.length > 0 ? (
            <XAxis alignY="center">
              <Box
                cursor="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                onHoverStateChange={(isHovered) => {
                  setIsHovered(isHovered);
                }}
              >
                <XAxis gap="0.25rem" alignY="center">
                  <Subtitle3 color={txFeeColor}>
                    <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.transaction-fee" />
                  </Subtitle3>
                  <AdjustmentIcon
                    width="1rem"
                    height="1rem"
                    color={txFeeColor}
                  />

                  {(() => {
                    if (uiConfigStore.rememberLastFeeOption) {
                      return (
                        <Box height="1px" width="0.375rem" alignY="center">
                          <Box alignX="center" alignY="center">
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
                        </Box>
                      );
                    }
                  })()}
                  {(() => {
                    if (
                      feeConfig.uiProperties.loadingState ||
                      gasSimulator.uiProperties.loadingState
                    ) {
                      return (
                        <Box
                          height="1px"
                          alignX="center"
                          alignY="center"
                          marginLeft="0.2rem"
                        >
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
                      );
                    }
                  })()}
                </XAxis>
              </Box>
              <div
                style={{
                  flex: 1,
                }}
              />
              <YAxis>
                {feeConfig.fees.map((fee) => {
                  return (
                    <Subtitle3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-200"]
                      }
                      key={fee.currency.coinMinimalDenom}
                    >
                      {fee
                        .quo(
                          new Dec(
                            isShowingEstimatedFee ? gasConfig.gas || 1 : 1
                          )
                        )
                        .mul(
                          new Dec(
                            isShowingEstimatedFee
                              ? gasSimulator.gasEstimated || 1
                              : 1
                          )
                        )
                        .maxDecimals(6)
                        .trim(true)
                        .shrink(true)
                        .inequalitySymbol(true)
                        .hideIBCMetadata(true)
                        .toString()}
                    </Subtitle3>
                  );
                })}
              </YAxis>
              <Gutter size="0.25rem" />
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                +{" "}
                {new IntPretty(amountConfig.swapFeeBps)
                  .moveDecimalPointLeft(2)
                  .trim(true)
                  .maxDecimals(4)
                  .inequalitySymbol(true)
                  .toString()}
                %
              </Subtitle3>
            </XAxis>
          ) : null}

          {amountConfig.otherFees.length > 0 ? (
            <React.Fragment>
              <Gutter size="0.5rem" />
              <XAxis alignY="center">
                <Box>
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-300"]
                    }
                  >
                    <FormattedMessage id="components.fee-info.bridge-fee" />
                  </Subtitle3>
                </Box>
                <div
                  style={{
                    flex: 1,
                  }}
                />

                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-300"]
                  }
                >
                  {(() => {
                    let totalPrice: PricePretty | undefined;
                    if (amountConfig.otherFees.length > 0) {
                      for (const fee of amountConfig.otherFees) {
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
                    }

                    if (totalPrice) {
                      return totalPrice.toString();
                    }
                    return "-";
                  })()}
                </Subtitle3>

                <Gutter size="0.25rem" />
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette["gray-100"]
                  }
                >
                  =
                </Subtitle3>
                <Gutter size="0.25rem" />
                <YAxis>
                  {amountConfig.otherFees.map((fee) => {
                    return (
                      <Subtitle3
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
                      </Subtitle3>
                    );
                  })}
                </YAxis>
              </XAxis>
            </React.Fragment>
          ) : null}

          {amountConfig instanceof SwapAmountConfig && amountConfig.provider ? (
            <React.Fragment>
              <Gutter size="0.5rem" />
              <XAxis alignY="center">
                <Box>
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                  >
                    <FormattedMessage id="components.fee-info.swap-provider" />
                  </Subtitle3>
                </Box>
                <div
                  style={{
                    flex: 1,
                  }}
                />
                <Box
                  borderRadius="9999px"
                  width="1rem"
                  height="1rem"
                  style={{
                    overflow: "hidden",
                  }}
                >
                  {amountConfig.provider === SwapProvider.SQUID ? (
                    <SquidIcon width="1rem" height="1rem" />
                  ) : (
                    <SkipIcon width="1rem" height="1rem" />
                  )}
                </Box>
                <Gutter size="0.5rem" />
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {amountConfig.provider
                    .toString()
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </Subtitle3>
              </XAxis>
            </React.Fragment>
          ) : null}

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
              nonceMethod={nonceMethod}
              setNonceMethod={setNonceMethod}
              swapAmountConfig={amountConfig}
            />
          </Modal>
        </Box>
      </React.Fragment>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};

const SquidIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="-1"
        y="-0.5"
        width="17"
        height="17"
        fill="url(#pattern0_21077_161652)"
      />
      <defs>
        <pattern
          id="pattern0_21077_161652"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_21077_161652" transform="scale(0.00444444)" />
        </pattern>
        <image
          id="image0_21077_161652"
          width="225"
          height="225"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

const SkipIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
    >
      <path
        d="M0 0 C63.36 0 126.72 0 192 0 C192 63.36 192 126.72 192 192 C128.64 192 65.28 192 0 192 C0 128.64 0 65.28 0 0 Z "
        fill="#FE65FE"
        transform="translate(0,0)"
      />
      <path
        d="M0 0 C18.15 0 36.3 0 55 0 C55 6.93 55 13.86 55 21 C52.42445312 21.06058594 49.84890625 21.12117188 47.1953125 21.18359375 C44.70651256 21.24536587 42.21775891 21.30876071 39.72900391 21.37231445 C37.99662374 21.4156808 36.26420037 21.45735463 34.53173828 21.49731445 C32.04446373 21.55497594 29.55740707 21.61868198 27.0703125 21.68359375 C26.29317902 21.70030624 25.51604553 21.71701874 24.71536255 21.73423767 C20.72725784 21.76473429 20.72725784 21.76473429 17 23 C17 24.65 17 26.3 17 28 C20.16491982 29.58245991 23.59042085 29.24166223 27.0703125 29.31640625 C27.77599365 29.33505737 28.4816748 29.3537085 29.20874023 29.3729248 C31.84736491 29.44127489 34.48619771 29.50139017 37.125 29.5625 C43.02375 29.706875 48.9225 29.85125 55 30 C55 45.51 55 61.02 55 77 C36.85 77 18.7 77 0 77 C0 70.07 0 63.14 0 56 C12.54 55.67 25.08 55.34 38 55 C38.33 52.69 38.66 50.38 39 48 C35.26604094 46.75534698 31.72635358 46.76780088 27.83203125 46.68359375 C27.12735718 46.66494263 26.42268311 46.6462915 25.69665527 46.6270752 C23.06872893 46.55886689 20.4405998 46.49866114 17.8125 46.4375 C11.934375 46.293125 6.05625 46.14875 0 46 C0 30.82 0 15.64 0 0 Z "
        fill="#080308"
        transform="translate(68,57)"
      />
    </svg>
  );
};
