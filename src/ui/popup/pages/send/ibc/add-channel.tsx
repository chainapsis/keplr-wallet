import React, { FunctionComponent, useState } from "react";
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
  ModalBody
} from "reactstrap";
import { Input } from "../../../../components/form";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { autorun } from "mobx";

import style from "./style.module.scss";
import { ChannelResponse } from "../../../stores/query/channel";
import { ClientStateResponse } from "../../../stores/query/client-state";

export const IBCChannelRegisterModal: FunctionComponent<{
  isOpen: boolean;
  closeModal: () => void;
  toggle: () => void;
}> = observer(({ isOpen, closeModal, toggle }) => {
  const { chainStore, queriesStore, ibcStore } = useStore();

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
              Destination Chain
            </Label>
            <ButtonDropdown
              id="chain-dropdown"
              className={style.chainSelector}
              isOpen={isChainDropdownOpen}
              toggle={() => setIsChainDropdownOpen(value => !value)}
            >
              <DropdownToggle caret>
                {selectedChainId
                  ? chainStore.getChain(selectedChainId).chainName
                  : "Select Chain"}
              </DropdownToggle>
              <DropdownMenu>
                {chainStore.chainList.map(chainInfo => {
                  if (chainStore.chainInfo.chainId !== chainInfo.chainId) {
                    return (
                      <DropdownItem
                        key={chainInfo.chainId}
                        onClick={e => {
                          e.preventDefault();

                          setSelectedChainId(chainInfo.chainId);
                          setError("");
                        }}
                      >
                        {chainInfo.chainName}
                      </DropdownItem>
                    );
                  }
                })}
              </DropdownMenu>
            </ButtonDropdown>
          </FormGroup>
          <Input
            type="text"
            label="Channel ID"
            placeholder="Destination Chain Channel ID"
            onChange={e => {
              e.preventDefault();
              setChannelId(e.target.value);
              setError("");
            }}
          />
          {error}
          <Button
            type="submit"
            block
            color="primary"
            disabled={
              selectedChainId === "" || channelId === "" || error !== ""
            }
            data-loading={isLoading}
            onClick={async e => {
              e.preventDefault();

              setIsLoading(true);

              const queries = queriesStore.get(chainStore.chainInfo.chainId);

              const channel = await new Promise<ChannelResponse | undefined>(
                resolve => {
                  const queryIBCChannel = queries.getQueryIBCChannel();

                  const channel = queryIBCChannel.getTransferChannel(channelId);

                  const disposer = autorun(() => {
                    if (!channel.isFetching) {
                      resolve(channel.response?.data);
                      disposer();
                    }
                  });
                }
              );

              const clientState = await new Promise<
                ClientStateResponse | undefined
              >(resolve => {
                const queryIBCChannel = queries.getQueryIBCClientState();

                const clientState = queryIBCChannel.getClientStateOnTransferPort(
                  channelId
                );

                const disposer = autorun(() => {
                  if (!clientState.isFetching) {
                    resolve(clientState.response?.data);
                    disposer();
                  }
                });
              });

              let error = "";

              if (!channel || !clientState) {
                error = "Failed to fetch the channel";
              }

              if (channel) {
                if (channel.channel.state !== "STATE_OPEN") {
                  error = "Channel is not on OPEN STATE";
                }
              }

              if (clientState) {
                if (
                  clientState.identified_client_state.client_state.chain_id !==
                  selectedChainId
                ) {
                  error = `Client is not for ${selectedChainId}`;
                }
              }

              setIsLoading(false);
              setError(error);

              if (channel && clientState && error === "") {
                await ibcStore.addChannels(
                  {
                    chainId: chainStore.chainInfo.chainId,
                    portId: "transfer",
                    channelId,
                    counterpartyChainId: selectedChainId
                  },
                  {
                    chainId: selectedChainId,
                    portId: channel.channel.counterparty.port_id,
                    channelId: channel.channel.counterparty.channel_id,
                    counterpartyChainId: chainStore.chainInfo.chainId
                  }
                );
                closeModal();
              }
            }}
          >
            Save
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
});
