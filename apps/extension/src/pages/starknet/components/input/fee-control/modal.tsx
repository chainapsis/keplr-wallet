import React, { FunctionComponent } from "react";
import { Subtitle1 } from "../../../../../components/typography";
import { ColorPalette } from "../../../../../styles";
import styled, { useTheme } from "styled-components";
import { Stack } from "../../../../../components/stack";
import { Dropdown } from "../../../../../components/dropdown";
import { Button } from "../../../../../components/button";
import { observer } from "mobx-react-lite";
import {
  IFeeConfig,
  IGasSimulator,
  ISenderConfig,
} from "@keplr-wallet/hooks-starknet";
import { useStore } from "../../../../../stores";
import { GuideBox } from "../../../../../components/guide-box";
import { Dec } from "@keplr-wallet/unit";
import { Box } from "../../../../../components/box";
import { FormattedMessage, useIntl } from "react-intl";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};

export const TransactionFeeModal: FunctionComponent<{
  close: () => void;

  senderConfig: ISenderConfig;
  feeConfig: IFeeConfig;
  gasSimulator?: IGasSimulator;
  disableAutomaticFeeSet?: boolean;
}> = observer(
  ({
    close,
    senderConfig,
    feeConfig,
    gasSimulator,
    disableAutomaticFeeSet,
  }) => {
    const { chainStore, starknetQueriesStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    const modularChainInfo = chainStore.getModularChain(senderConfig.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error("This chain doesn't support starknet");
    }
    const starknet = modularChainInfo.starknet;

    return (
      <Styles.Container>
        <Box marginBottom="1.25rem" marginLeft="0.5rem" paddingY="0.4rem">
          <Subtitle1>
            <FormattedMessage id="components.input.fee-control.modal.title" />
          </Subtitle1>
        </Box>

        <Stack gutter="0.75rem">
          <Dropdown
            label={intl.formatMessage({
              id: "components.input.fee-control.modal.fee-token-dropdown-label",
            })}
            menuContainerMaxHeight="10rem"
            items={["ETH", "STRK"]
              .filter((type) => {
                const contractAddress =
                  type === "ETH"
                    ? starknet.ethContractAddress
                    : starknet.strkContractAddress;
                const cur = starknet.currencies.find(
                  (cur) => cur.contractAddress === contractAddress
                );
                if (!cur) {
                  return false;
                }

                const balance = starknetQueriesStore
                  .get(feeConfig.chainId)
                  .queryStarknetERC20Balance.getBalance(
                    feeConfig.chainId,
                    chainStore,
                    senderConfig.sender,
                    cur.coinMinimalDenom
                  );

                return balance?.balance.toDec().gt(new Dec(0));
              })
              .map((type) => {
                return {
                  key: type,
                  label: type,
                };
              })}
            selectedItemKey={feeConfig.type}
            onSelect={(key) => {
              feeConfig.setType(key as "ETH" | "STRK");
            }}
            size="large"
          />

          {(() => {
            if (gasSimulator) {
              if (gasSimulator.uiProperties.error) {
                return (
                  <GuideBox
                    color="danger"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      gasSimulator.uiProperties.error.message ||
                      gasSimulator.uiProperties.error.toString()
                    }
                  />
                );
              }

              if (gasSimulator.uiProperties.warning) {
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      gasSimulator.uiProperties.warning.message ||
                      gasSimulator.uiProperties.warning.toString()
                    }
                  />
                );
              }
            }
          })()}

          {disableAutomaticFeeSet ? (
            <GuideBox
              title={intl.formatMessage({
                id: "components.input.fee-control.modal.guide.external-fee-set",
              })}
              backgroundColor={
                theme.mode === "light" ? undefined : ColorPalette["gray-500"]
              }
            />
          ) : null}

          <Button
            type="button"
            text={intl.formatMessage({
              id: "button.close",
            })}
            color="secondary"
            size="large"
            onClick={() => {
              close();
            }}
          />
        </Stack>
      </Styles.Container>
    );
  }
);
