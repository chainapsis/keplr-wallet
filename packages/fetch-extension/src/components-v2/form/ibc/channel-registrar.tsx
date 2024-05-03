import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Form, FormGroup, Label, Spinner } from "reactstrap";
import { Dropdown } from "@components-v2/dropdown";
import style from "./style.module.scss";
import { Input } from "../input";
import { FormattedMessage, useIntl } from "react-intl";
import { Card } from "@components-v2/card";
import { ButtonV2 } from "@components-v2/buttons/button";
export const IBCChannelRegistrar: FunctionComponent<{
  isOpen: boolean;
  closeModal: () => void;
  toggle: () => void;
}> = observer(({ closeModal }) => {
  const intl = useIntl();
  const { chainStore, queriesStore, ibcChannelStore } = useStore();

  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);

  const [selectedChainId, setSelectedChainId] = useState("");

  const [channelId, setChannelId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  return (
    <Form>
      <FormGroup>
        <Label for="chain-dropdown" className="form-control-label">
          <FormattedMessage id="component.ibc.channel-registrar.chain-selector.label" />
        </Label>
        <button
          type="button"
          className={style["selector"]}
          onClick={() => setIsChainDropdownOpen((value) => !value)}
        >
          {selectedChainId ? (
            chainStore.getChain(selectedChainId).chainName
          ) : (
            <FormattedMessage id="component.ibc.channel-registrar.chain-selector.placeholder" />
          )}
          <img src={require("@assets/svg/wireframe/chevron-down.svg")} alt="" />
        </button>
        <Dropdown
          title="Destination chain"
          isOpen={isChainDropdownOpen}
          setIsOpen={setIsChainDropdownOpen}
          closeClicked={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
        >
          {chainStore.chainInfos.map((chainInfo) => {
            if (chainStore.current.chainId !== chainInfo.chainId) {
              if ((chainInfo.features ?? []).includes("ibc-transfer")) {
                return (
                  <Card
                    heading={chainInfo.chainName}
                    key={chainInfo.chainId}
                    onClick={(e: any) => {
                      e.preventDefault();
                      setSelectedChainId(chainInfo.chainId);
                      setError("");
                      setIsChainDropdownOpen(false);
                    }}
                  />
                );
              }
            }
          })}
        </Dropdown>
      </FormGroup>
      <Input
        className={style["selector"]}
        type="text"
        label={intl.formatMessage({
          id: "component.ibc.channel-registrar.chain-selector.add.channel.label",
        })}
        placeholder={intl.formatMessage({
          id: "component.ibc.channel-registrar.chain-selector.add.channel.placeholder",
        })}
        onChange={(e) => {
          e.preventDefault();
          const field = e.target.value;
          setChannelId(isNaN(parseFloat(field)) ? field : `channel-${field}`);
          setError("");
        }}
        error={error}
      />
      <ButtonV2
        text={
          isLoading ? (
            <Spinner size="sm">Adding</Spinner>
          ) : (
            <FormattedMessage id="component.ibc.channel-registrar.chain-selector.add.channel.button" />
          )
        }
        disabled={selectedChainId === "" || channelId === "" || error !== ""}
        data-loading={isLoading}
        onClick={async (e: any) => {
          e.preventDefault();

          setIsLoading(true);

          const queries = queriesStore.get(chainStore.current.chainId);

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
            await ibcChannelStore.get(chainStore.current.chainId).addChannel({
              portId: "transfer",
              channelId,
              counterpartyChainId: selectedChainId,
            });

            await ibcChannelStore.get(selectedChainId).addChannel({
              portId: channel.data.channel.counterparty.port_id,
              channelId: channel.data.channel.counterparty.channel_id,
              counterpartyChainId: chainStore.current.chainId,
            });

            closeModal();
          }
        }}
      />
    </Form>
  );
});
