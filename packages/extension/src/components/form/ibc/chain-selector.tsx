import React, { FunctionComponent, useState } from "react";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Label,
} from "reactstrap";

import style from "./style.module.scss";
import { IBCChannelRegistrarModal } from "./channel-registrar";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";
import { FormattedMessage } from "react-intl";

export const DestinationChainSelector: FunctionComponent<{
  ibcChannelConfig: IIBCChannelConfig;
}> = observer(({ ibcChannelConfig }) => {
  const { chainStore, ibcChannelStore } = useStore();
  const ibcChannelInfo = ibcChannelStore.get(chainStore.current.chainId);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [isIBCRegisterModalOpen, setIsIBCregisterModalOpen] = useState(false);

  const [selectorId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `destination-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <React.Fragment>
      <IBCChannelRegistrarModal
        isOpen={isIBCRegisterModalOpen}
        closeModal={() => setIsIBCregisterModalOpen(false)}
        toggle={() => setIsIBCregisterModalOpen((value) => !value)}
      />
      <FormGroup>
        <Label for={selectorId} className="form-control-label">
          <FormattedMessage id="component.ibc.channel-registrar.chain-selector.label" />
        </Label>
        <ButtonDropdown
          id={selectorId}
          className={style.chainSelector}
          isOpen={isSelectorOpen}
          toggle={() => setIsSelectorOpen((value) => !value)}
        >
          <DropdownToggle caret>
            {ibcChannelConfig.channel ? (
              chainStore.getChain(ibcChannelConfig.channel.counterpartyChainId)
                .chainName
            ) : (
              <FormattedMessage id="component.ibc.channel-registrar.chain-selector.placeholder" />
            )}
          </DropdownToggle>
          <DropdownMenu>
            {ibcChannelInfo.getTransferChannels().map((channel) => {
              if (!chainStore.hasChain(channel.counterpartyChainId)) {
                return undefined;
              }

              const chainInfo = chainStore.getChain(
                channel.counterpartyChainId
              );

              if (chainInfo) {
                return (
                  <DropdownItem
                    key={chainInfo.chainId}
                    onClick={(e) => {
                      e.preventDefault();

                      ibcChannelConfig.setChannel(channel);
                    }}
                  >
                    {chainInfo.chainName}
                    <div className={style.channel}>{channel.channelId}</div>
                  </DropdownItem>
                );
              }
            })}
            <DropdownItem
              onClick={(e) => {
                e.preventDefault();

                setIsIBCregisterModalOpen(true);
              }}
            >
              <i className="fas fa-plus-circle my-1 mr-1" />{" "}
              <FormattedMessage id="component.ibc.channel-registrar.chain-selector.button.add" />
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </FormGroup>
    </React.Fragment>
  );
});
