import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { Body2, Subtitle1 } from "../../../../components/typography";
import { Stack } from "../../../../components/stack";
import { Dropdown } from "../../../../components/dropdown";
import {
  useFeeConfig,
  useGasConfig,
  useNoopAmountConfig,
  useSenderConfig,
} from "@keplr-wallet/hooks-starknet";
import { Button } from "../../../../components/button";
import { Column, Columns } from "../../../../components/column";
import { GetStarknetKeyParamsMsg } from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

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

export const AccountActivationModal: FunctionComponent<{
  close: () => void;
  chainId: string;
}> = observer(({ close, chainId }) => {
  const {
    chainStore,
    accountStore,
    starknetQueriesStore,
    starknetAccountStore,
  } = useStore();
  const intl = useIntl();
  const account = accountStore.getAccount(chainId);

  const sender = account.starknetHexAddress;
  const senderConfig = useSenderConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    sender
  );
  const amountConfig = useNoopAmountConfig(chainStore, chainId, senderConfig);
  const gasConfig = useGasConfig(chainStore, chainId);
  const feeConfig = useFeeConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  const modularChainInfo = chainStore.getModularChain(senderConfig.chainId);
  if (!("starknet" in modularChainInfo)) {
    throw new Error("This chain doesn't support starknet");
  }

  return (
    <Styles.Container>
      <Box marginBottom="1.25rem" marginLeft="0.5rem" paddingY="0.4rem">
        <Subtitle1>
          <FormattedMessage id="page.starknet.components.account-activation-modal.title" />
        </Subtitle1>
      </Box>

      <Stack gutter="1.25rem">
        <Box marginLeft="0.5rem" marginRight="0.5rem">
          <Body2 style={{ lineHeight: 1.5 }}>
            <FormattedMessage
              id="page.starknet.components.account-activation-modal.description"
              values={{
                br: <br />,
              }}
            />
          </Body2>
        </Box>
        <Box>
          <Dropdown
            label={intl.formatMessage({
              id: "components.input.fee-control.modal.fee-token-dropdown-label",
            })}
            menuContainerMaxHeight="10rem"
            items={["ETH", "STRK"].map((type) => {
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
        </Box>
        <Columns sum={1} gutter="0.75rem">
          <Column weight={1}>
            <Button
              type="button"
              text={intl.formatMessage({
                id: "button.back",
              })}
              color="secondary"
              size="large"
              onClick={() => {
                close();
              }}
            />
          </Column>

          <Column weight={1}>
            <Button
              type="button"
              text={intl.formatMessage({
                id: "button.activate",
              })}
              size="large"
              onClick={async () => {
                const msg = new GetStarknetKeyParamsMsg(senderConfig.chainId);
                const params =
                  await new InExtensionMessageRequester().sendMessage(
                    BACKGROUND_PORT,
                    msg
                  );

                starknetAccountStore
                  .getAccount(senderConfig.chainId)
                  .deployAccount(
                    accountStore.getAccount(senderConfig.chainId)
                      .starknetHexAddress,
                    "0x" + Buffer.from(params.classHash).toString("hex"),
                    [
                      "0x" + Buffer.from(params.xLow).toString("hex"),
                      "0x" + Buffer.from(params.xHigh).toString("hex"),
                      "0x" + Buffer.from(params.yLow).toString("hex"),
                      "0x" + Buffer.from(params.yHigh).toString("hex"),
                    ],
                    "0x" + Buffer.from(params.salt).toString("hex"),
                    "ETH"
                  )
                  .then(console.log)
                  .catch(console.log);
              }}
            />
          </Column>
        </Columns>
      </Stack>
    </Styles.Container>
  );
});
