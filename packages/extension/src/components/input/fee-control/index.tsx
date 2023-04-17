import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { IFeeConfig, IGasConfig, ISenderConfig } from "@keplr-wallet/hooks";
import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import { Column, Columns } from "../../column";
import { Subtitle3, Subtitle4 } from "../../typography";
import { ArrowRightIcon, SettingIcon } from "../../icon";
import { Stack } from "../../stack";
import { Modal } from "../../modal";
import { TransactionFeeModal } from "./modal";
import { useStore } from "../../../stores";
import { autorun } from "mobx";

const Styles = {
  Container: styled.div`
    padding: 0.875rem 0.25rem 0.875rem 1rem;
    background-color: ${ColorPalette["gray-600"]};

    border: 1.5px solid rgba(44, 75, 226, 0.5);
    border-radius: 0.375rem;

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

  disableAutomaticFeeSet?: boolean;
}> = observer(
  ({ senderConfig, feeConfig, gasConfig, disableAutomaticFeeSet }) => {
    const { queriesStore } = useStore();

    useEffect(() => {
      if (disableAutomaticFeeSet) {
        return;
      }

      if (
        feeConfig.fees.length === 0 ||
        !feeConfig.selectableFeeCurrencies.find(
          (cur) =>
            cur.coinMinimalDenom === feeConfig.fees[0].currency.coinMinimalDenom
        )
      ) {
        if (feeConfig.selectableFeeCurrencies.length > 0) {
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
    ]);

    useEffect(() => {
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
          !(feeConfig.type !== "manual") &&
          feeConfig.selectableFeeCurrencies.length > 1 &&
          feeConfig.fees.length > 0 &&
          feeConfig.selectableFeeCurrencies[0].coinMinimalDenom ===
            feeConfig.fees[0].currency.coinMinimalDenom
        ) {
          const queryBalances = queriesStore
            .get(feeConfig.chainId)
            .queryBalances.getQueryBech32Address(senderConfig.sender);

          // Basically, `FeeConfig` implementation select the first fee currency as default.
          // So, let's put the priority to first fee currency.
          const firstFeeCurrency = feeConfig.selectableFeeCurrencies[0];
          const firstFeeCurrencyBal =
            queryBalances.getBalanceFromCurrency(firstFeeCurrency);

          if (feeConfig.type !== "manual") {
            const fee = feeConfig.getFeeTypePrettyForFeeCurrency(
              firstFeeCurrency,
              feeConfig.type
            );
            if (firstFeeCurrencyBal.toDec().lt(fee.toDec())) {
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
                  skip = true;
                  return;
                }
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
      <Styles.Container onClick={() => setIsModalOpen(true)}>
        <Columns sum={1} alignY="center">
          <Columns sum={1} alignY="center">
            <Subtitle4>Transaction Fee</Subtitle4>
            <SettingIcon width="1rem" height="1rem" />
          </Columns>

          <Column weight={1} />

          <Columns sum={1} gutter="0.25rem" alignY="center">
            <Stack gutter="0.25rem" alignX="right">
              <Subtitle3>
                {feeConfig.fees
                  .map((fee) => {
                    return fee.maxDecimals(6).inequalitySymbol(true).toString();
                  })
                  .join(",")}
              </Subtitle3>
              <Subtitle3 style={{ color: ColorPalette["gray-300"] }}>
                $153.50 (TODO)
              </Subtitle3>
            </Stack>

            <Styles.IconContainer>
              <ArrowRightIcon />
            </Styles.IconContainer>
          </Columns>
        </Columns>

        <Modal isOpen={isModalOpen}>
          <TransactionFeeModal
            close={() => setIsModalOpen(false)}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
          />
        </Modal>
      </Styles.Container>
    );
  }
);

const noop = (..._args: any[]) => {
  // noop
};
