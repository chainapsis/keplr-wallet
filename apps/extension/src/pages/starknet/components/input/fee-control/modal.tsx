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
    const { chainStore } = useStore();
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
                const cur = chainStore
                  .getModularChainInfoImpl(senderConfig.chainId)
                  .getCurrencies("starknet")
                  .find(
                    (cur) =>
                      "contractAddress" in cur &&
                      cur.contractAddress === contractAddress
                  );
                if (!cur) {
                  return false;
                }

                return true;
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
            const trimMessage = (message: string): string => {
              if (message) {
                // 정규 표현식을 사용하여 execution_error 추출
                const executionErrorMatch = message.match(
                  /"execution_error":"(.+?)"/g
                );

                // execution_error 값이 존재하는 경우 출력
                if (
                  executionErrorMatch &&
                  executionErrorMatch[0] &&
                  executionErrorMatch[0].startsWith('"execution_error":')
                ) {
                  let m = executionErrorMatch[0].replace(
                    '"execution_error":',
                    ""
                  );
                  if (m.length >= 2) {
                    m = m.substring(1, m.length - 1);
                  }
                  const match = m.match(/Failure reason:(.+)/g);
                  if (
                    match &&
                    match[0] &&
                    match[0].startsWith("Failure reason:")
                  ) {
                    message = match[0].replace("Failure reason:", "");
                    message = message.replace(/\\n/g, "\n"); // 줄 바꿈 문자 처리
                  }
                }
              }
              return message;
            };

            if (gasSimulator) {
              if (gasSimulator.uiProperties.error) {
                return (
                  <GuideBox
                    color="danger"
                    title={intl.formatMessage({
                      id: "components.input.fee-control.modal.guide-title",
                    })}
                    paragraph={
                      trimMessage(gasSimulator.uiProperties.error.message) ||
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
                      trimMessage(gasSimulator.uiProperties.warning.message) ||
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
