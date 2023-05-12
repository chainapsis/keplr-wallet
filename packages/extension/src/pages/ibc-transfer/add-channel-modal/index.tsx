import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { Subtitle1, Subtitle3 } from "../../../components/typography";
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
  const [channelId, setChannelId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <YAxis alignX="center">
      <Box
        width="20rem"
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

        <Subtitle3 color={ColorPalette["gray-100"]}>
          Destination Chain
        </Subtitle3>

        <Gutter size="0.375rem" />

        <Dropdown
          size="large"
          placeholder="Select Chain"
          selectedItemKey={selectedChainId}
          items={chainStore.chainInfos
            .filter(
              (chainInfo) =>
                chainInfo.chainId !== chainId &&
                (chainInfo.features ?? []).includes("ibc-transfer")
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
          onChange={(event) => {
            const field = event.target.value;
            setChannelId(isNaN(parseFloat(field)) ? field : `channel-${field}`);
            setError("");
          }}
          error={error}
        />

        <Gutter size="1.375rem" />

        <Button
          text="Save"
          disabled={selectedChainId === "" || channelId === "" || error !== ""}
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true);

            const queries = queriesStore.get(chainId);

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

            console.log("channel", channel);
            console.log("clientState", clientState);
            console.log(error);

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
