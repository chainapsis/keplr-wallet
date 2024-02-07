import React, { FunctionComponent, useState } from "react";
import { IFeeConfig, IGasConfig, ISenderConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useTheme } from "styled-components";
import {
  useAutoFeeCurrencySelectionOnInit,
  useFeeOptionSelectionOnInit,
} from "../../../../components/input/fee-control";
import { Box } from "../../../../components/box";
import { XAxis, YAxis } from "../../../../components/axis";
import { Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { TransactionFeeModal } from "../../../../components/input/fee-control/modal";
import { Modal } from "../../../../components/modal";
import { Gutter } from "../../../../components/gutter";
import { InformationIcon } from "../../../../components/icon";
import { Tooltip } from "../../../../components/tooltip";
import { Tag } from "../../../../components/tag";
import { useIntl } from "react-intl";

export const FeeBox: FunctionComponent<{
  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;

  disableAutomaticFeeSet: boolean | undefined;
  isInternal: boolean;
}> = observer(
  ({
    senderConfig,
    feeConfig,
    gasConfig,
    disableAutomaticFeeSet,
    isInternal,
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

    const canOpenFeeModal =
      !disableAutomaticFeeSet || (disableAutomaticFeeSet && !isInternal);

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
      >
        <XAxis alignY="center">
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-200"]
            }
            style={{
              textDecoration: canOpenFeeModal ? "underline" : undefined,
              cursor: canOpenFeeModal ? "pointer" : undefined,
            }}
            onClick={(e) => {
              e.preventDefault();

              if (canOpenFeeModal) {
                analyticsStore.logEvent("click_txFeeSet");
                setIsModalOpen(true);
              }
            }}
          >
            Fee Options
          </Subtitle3>
          {canOpenFeeModal && disableAutomaticFeeSet ? (
            <React.Fragment>
              <Gutter size="2px" />
              <Tooltip content="The fee suggested by the website or dApp.">
                <InformationIcon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                  }
                  width="1rem"
                  height="1rem"
                />
              </Tooltip>
            </React.Fragment>
          ) : null}

          <div style={{ flex: 1 }} />

          <YAxis>
            {(() => {
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
              .map((text) => {
                return (
                  <Subtitle3
                    key={text}
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-600"]
                        : ColorPalette["gray-50"]
                    }
                  >
                    {text}
                  </Subtitle3>
                );
              })}
          </YAxis>

          <Gutter size="0.25rem" />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-300"]
            }
          >
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
                return "(-)";
              }
              return `(${total.toString()})`;
            })()}
          </Subtitle3>

          {(() => {
            if (feeConfig.type === "low" || feeConfig.type === "high") {
              return (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Tag
                    text={intl.formatMessage({
                      id: `components.input.fee-control.modal.fee-selector.${feeConfig.type}`,
                    })}
                  />
                </React.Fragment>
              );
            }

            return null;
          })()}
        </XAxis>

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
          />
        </Modal>
      </Box>
    );
  }
);
