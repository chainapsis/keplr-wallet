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

export const IBCAddChannelModal: FunctionComponent<{
  chainId: string;
  close: () => void;
}> = observer(({ chainId, close }) => {
  const { chainStore, queriesStore, ibcChannelStore } = useStore();

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
        backgroundColor={ColorPalette["gray-600"]}
        borderRadius="0.5rem"
      >
        <Subtitle1
          style={{
            color: ColorPalette["gray-10"],
          }}
        >
          Add IBC channel
        </Subtitle1>

        <Gutter size="1.125rem" />

        <Dropdown
          size="large"
          label="Destination Chain"
          placeholder="Select Chain"
          selectedItemKey={selectedChainId}
          items={chainStore.chainInfosInUI
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
        />

        <Gutter size="1.125rem" />

        <TextInput
          label="Channel Id"
          placeholder="Source Channel ID"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          error={error}
        />

        <Gutter size="1.375rem" />

        <Button
          text="Save"
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
              error = "Failed to fetch the channel";
            }

            if (channel) {
              if (channel.data.channel.state !== "STATE_OPEN") {
                error = "Channel is not on OPEN STATE";
              }
            }

            if (clientState) {
              if (
                clientState.data.identified_client_state.client_state[
                  "chain_id"
                ] !== selectedChainId
              ) {
                error = `Client is not for ${selectedChainId}`;
              }
            }

            setIsLoading(false);
            setError(error);

            if (channel && clientState && error === "") {
              await ibcChannelStore.get(chainId).addChannel({
                portId: "transfer",
                channelId,
                counterpartyChainId: selectedChainId,
              });

              await ibcChannelStore.get(selectedChainId).addChannel({
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
