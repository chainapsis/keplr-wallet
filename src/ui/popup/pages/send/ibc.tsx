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
import { Input } from "../../../components/form";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { autorun } from "mobx";

export const IBCChannelRegisterModal: FunctionComponent = observer(() => {
  const { chainStore, queriesStore } = useStore();

  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);

  const [selectedChainId, setSelectedChainId] = useState("");

  const [channelId, setChannelId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal isOpen={true} centered>
      <ModalBody>
        <Form>
          <h1>Add IBC channel</h1>
          <Label for="chain-dropdown" className="form-control-label">
            Destination Chain
          </Label>
          <ButtonDropdown
            id="chain-dropdown"
            style={{ width: "100%" }}
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
                return (
                  <DropdownItem
                    key={chainInfo.chainId}
                    onClick={e => {
                      e.preventDefault();

                      setSelectedChainId(chainInfo.chainId);
                    }}
                  >
                    {chainInfo.chainName}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </ButtonDropdown>
          <FormGroup>
            <Input
              type="text"
              label="Channel ID"
              placeholder="Destination Chain Channel ID"
              onChange={e => {
                e.preventDefault();
                setChannelId(e.target.value);
              }}
            />
          </FormGroup>
          <Button
            type="submit"
            block
            color="primary"
            disabled={selectedChainId === "" || channelId === ""}
            data-loading={isLoading}
            onClick={async e => {
              e.preventDefault();

              setIsLoading(true);

              const channel = await new Promise(resolve => {
                const queryIBCChannel = queriesStore
                  .get(selectedChainId)
                  .getQueryIBCChannel();

                const channel = queryIBCChannel.getTransferChannel(channelId);

                const disposer = autorun(() => {
                  if (!channel.isFetching) {
                    resolve(channel.response);
                    disposer();
                  }
                });
              });

              console.log(channel);

              setIsLoading(false);
            }}
          >
            Save
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
});
