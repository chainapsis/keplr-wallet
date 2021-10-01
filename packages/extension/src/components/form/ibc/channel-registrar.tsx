import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import {
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
} from "reactstrap";

import style from "./style.module.scss";
import { Input } from "../input";
import { FormattedMessage, useIntl } from "react-intl";

export const IBCChannelRegistrarModal: FunctionComponent<{
  isOpen: boolean;
  closeModal: () => void;
  toggle: () => void;
}> = observer(({ isOpen, closeModal, toggle }) => {
  const intl = useIntl();
  const { chainStore, queriesStore, ibcChannelStore } = useStore();

  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);

  const [selectedChainId, setSelectedChainId] = useState("");

  const [channelId, setChannelId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalBody>
        <Form>
          <h1>Add IBC channel</h1>
          <FormGroup>
            <Label for="chain-dropdown" className="form-control-label">
              <FormattedMessage id="component.ibc.channel-registrar.chain-selector.label" />
            </Label>
            <ButtonDropdown
              id="chain-dropdown"
              className={style.chainSelector}
              isOpen={isChainDropdownOpen}
              toggle={() => setIsChainDropdownOpen((value) => !value)}
            >
              <DropdownToggle caret>
                {selectedChainId ? (
                  chainStore.getChain(selectedChainId).chainName
                ) : (
                  <FormattedMessage id="component.ibc.channel-registrar.chain-selector.placeholder" />
                )}
              </DropdownToggle>
              <DropdownMenu>
                {chainStore.chainInfos.map((chainInfo) => {
                  if (chainStore.current.chainId !== chainInfo.chainId) {
                    if ((chainInfo.features ?? []).includes("ibc-transfer")) {
                      return (
                        <DropdownItem
                          key={chainInfo.chainId}
                          onClick={(e) => {
                            e.preventDefault();

                            setSelectedChainId(chainInfo.chainId);
                            setError("");
                          }}
                        >
                          {chainInfo.chainName}
                        </DropdownItem>
                      );
                    }
                  }
                })}
              </DropdownMenu>
            </ButtonDropdown>
          </FormGroup>
          <Input
            type="text"
            label={intl.formatMessage({
              id:
                "component.ibc.channel-registrar.chain-selector.add.channel.label",
            })}
            placeholder={intl.formatMessage({
              id:
                "component.ibc.channel-registrar.chain-selector.add.channel.placeholder",
            })}
            onChange={(e) => {
              e.preventDefault();
              setChannelId(e.target.value);
              setError("");
            }}
            error={error}
          />
          <Button
            type="submit"
            block
            color="primary"
            disabled={
              selectedChainId === "" || channelId === "" || error !== ""
            }
            data-loading={isLoading}
            onClick={async (e) => {
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
                  clientState.data.identified_client_state.client_state
                    .chain_id !== selectedChainId
                ) {
                  error = `Client is not for ${selectedChainId}`;
                }
              }

              setIsLoading(false);
              setError(error);

              if (channel && clientState && error === "") {
                await ibcChannelStore
                  .get(chainStore.current.chainId)
                  .addChannel({
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
          >
            <FormattedMessage id="component.ibc.channel-registrar.chain-selector.add.channel.button" />
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
});
