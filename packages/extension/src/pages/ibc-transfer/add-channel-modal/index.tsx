import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { Subtitle1 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { Dropdown } from "../../../components/dropdown";
import { TextInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { YAxis } from "../../../components/axis";
import { useStore } from "../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";

export const IBCAddChannelModal: FunctionComponent<{
  chainId: string;
  close: () => void;
}> = observer(({ chainId, close }) => {
  const { chainStore, queriesStore, ibcChannelStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const [selectedChainId, setSelectedChainId] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <YAxis alignX="center">
      <Box
        width="90%"
        maxWidth="22.5rem"
        padding="1.5rem 1rem"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        borderRadius="0.5rem"
      >
        <Subtitle1>
          <FormattedMessage id="page.ibc-transfer.add-channel-modal.title" />
        </Subtitle1>

        <Gutter size="1.125rem" />

        <Dropdown
          size="large"
          label={intl.formatMessage({
            id: "page.ibc-transfer.add-channel-modal.destination-chain-label",
          })}
          placeholder={intl.formatMessage({
            id: "page.ibc-transfer.add-channel-modal.destination-chain-placeholder",
          })}
          menuContainerMaxHeight="10rem"
          selectedItemKey={selectedChainId}
          items={chainStore.chainInfos
            .filter(
              (chainInfo) =>
                chainInfo.chainId !== chainId &&
                chainInfo.hasFeature("ibc-transfer")
            )
            .map((chainInfo) => {
              return {
                key: chainInfo.chainId,
                label: chainInfo.chainName,
              };
            })}
          onSelect={(key) => {
            setSelectedChainId(key);
            setError("");
          }}
          allowSearch={true}
        />

        <Gutter size="1.125rem" />

        <TextInput
          label={intl.formatMessage({
            id: "page.ibc-transfer.add-channel-modal.channel-id-label",
          })}
          placeholder={intl.formatMessage({
            id: "page.ibc-transfer.add-channel-modal.channel-id-placeholder",
          })}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          error={error}
        />

        <Gutter size="1.375rem" />

        <Button
          text={intl.formatMessage({
            id: "button.save",
          })}
          disabled={
            selectedChainId === "" || value.trim() === "" || error !== ""
          }
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true);

            const queries = queriesStore.get(chainId);

            const channelId = Number.isNaN(parseFloat(value.trim()))
              ? value
              : `channel-${value}`;

            const channel = await queries.cosmos.queryIBCChannel
              .getTransferChannel(channelId)
              .waitFreshResponse();

            const clientState = await queries.cosmos.queryIBCClientState
              .getClientStateOnTransferPort(channelId)
              .waitFreshResponse();

            let error = "";

            if (!channel || !clientState) {
              error = intl.formatMessage({
                id: "error.failed-to-fetch-the-channel",
              });
            }

            if (channel) {
              if (channel.data.channel.state !== "STATE_OPEN") {
                error = intl.formatMessage({
                  id: "error.channel-is-not-open-state",
                });
              }
            }

            if (clientState) {
              if (
                clientState.data.identified_client_state.client_state[
                  "chain_id"
                ] !== selectedChainId
              ) {
                error = intl.formatMessage(
                  { id: "error.client-is-not-for-chain" },
                  { chainId: selectedChainId }
                );
              }
            }

            setIsLoading(false);
            setError(error);

            if (channel && clientState && error === "") {
              ibcChannelStore.addChannel(chainId, {
                portId: "transfer",
                channelId,
                counterpartyChainId: selectedChainId,
              });

              ibcChannelStore.addChannel(selectedChainId, {
                portId: channel.data.channel.counterparty.port_id,
                channelId: channel.data.channel.counterparty.channel_id,
                counterpartyChainId: chainId,
              });

              close();
            }
          }}
        />
      </Box>
    </YAxis>
  );
});
