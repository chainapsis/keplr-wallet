import React, { FunctionComponent, useMemo, useState } from "react";
import {
  ButtonDropdown,
  FormGroup,
  Label,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

import style from "./style.module.scss";
import { useTxState } from "../../../../contexts/tx";
import { IBCChannelRegisterModal } from "./add-channel";

export const DestinationSelector: FunctionComponent = observer(() => {
  const { chainStore, ibcStore } = useStore();

  const ibcInfo = ibcStore.get(chainStore.chainInfo.chainId);

  const txState = useTxState();

  const [selectorId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `destination-${Buffer.from(bytes).toString("hex")}`;
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const selectedChain = useMemo(() => {
    if (!txState.ibcSendTo) {
      return undefined;
    }

    return chainStore.chainList.find(
      chainInfo => chainInfo.chainId === txState.ibcSendTo?.counterpartyChainId
    );
  }, [chainStore.chainList, txState.ibcSendTo]);

  const [isIBCRegisterModalOpen, setIsIBCregisterModalOpen] = useState(false);

  return (
    <div>
      <IBCChannelRegisterModal
        isOpen={isIBCRegisterModalOpen}
        closeModal={() => setIsIBCregisterModalOpen(false)}
        toggle={() => setIsIBCregisterModalOpen(value => !value)}
      />
      <FormGroup>
        <Label for={selectorId} className="form-control-label">
          Destination Chain
        </Label>
        <ButtonDropdown
          id={selectorId}
          className={style.chainSelector}
          isOpen={isSelectorOpen}
          toggle={() => setIsSelectorOpen(value => !value)}
        >
          <DropdownToggle caret>
            {selectedChain ? selectedChain.chainName : "Select Chain"}
          </DropdownToggle>
          <DropdownMenu>
            {ibcInfo.getTransferChannels().map(channel => {
              const chainInfo = chainStore.chainList.find(
                chainInfo => chainInfo.chainId === channel.counterpartyChainId
              );

              if (chainInfo) {
                return (
                  <DropdownItem
                    key={chainInfo.chainId}
                    onClick={e => {
                      e.preventDefault();

                      txState.setIBCSendTo(channel);
                    }}
                  >
                    {`${chainInfo.chainName} (${channel.channelId})`}
                  </DropdownItem>
                );
              }
            })}
            {
              <DropdownItem
                onClick={e => {
                  e.preventDefault();

                  setIsIBCregisterModalOpen(true);
                }}
              >
                <i className="fas fa-plus-circle my-1 mr-1" /> New IBC Transfer
                Channel
              </DropdownItem>
            }
          </DropdownMenu>
        </ButtonDropdown>
      </FormGroup>
    </div>
  );
});
