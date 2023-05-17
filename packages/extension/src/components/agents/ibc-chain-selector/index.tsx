import React, { FunctionComponent, useState } from "react";
import {
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Label,
} from "reactstrap";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { FormattedMessage } from "react-intl";
import { IBCChannelRegistrarModal } from "@components/form";
import { Channel } from "@keplr-wallet/hooks";
import { deliverMessages } from "@graphQL/messages-api";
import { useSelector } from "react-redux";
import { userDetails } from "@chatStore/user-slice";
import { useNotification } from "@components/notification";
import { useHistory } from "react-router";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainInfoInner } from "@keplr-wallet/stores";
import { Int } from "@keplr-wallet/unit";
import { useLoadingIndicator } from "@components/loading-indicator";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";

interface ChannelDetails extends Channel {
  counterPartyBech32Prefix: string;
  revisionNumber: string;
  revisionHeight: string;
}

export const IBCChainSelector: FunctionComponent<{
  label: string;
  disabled: boolean;
}> = observer(({ label, disabled }) => {
  const {
    accountStore,
    chainStore,
    ibcChannelStore,
    queriesStore,
  } = useStore();
  const loadingIndicator = useLoadingIndicator();

  const current = chainStore.current;
  const ibcChannelInfo = ibcChannelStore.get(current.chainId);
  const accountInfo = accountStore.getAccount(current.chainId);
  const history = useHistory();
  const targetAddress = history.location.pathname.split("/")[3];
  const notification = useNotification();
  const user = useSelector(userDetails);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelDetails>();
  const [isIBCRegisterModalOpen, setIsIBCregisterModalOpen] = useState(false);

  const [selectorId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `destination-${Buffer.from(bytes).toString("hex")}`;
  });

  const sendChannelDetails = async () => {
    if (selectedChannel) {
      const chainInfo = chainStore.getChain(
        selectedChannel.counterpartyChainId
      );

      const messagePayload = {
        channel: selectedChannel,
        message: `Selected Channel: ${chainInfo.chainName}`,
      };
      try {
        await deliverMessages(
          user.accessToken,
          current.chainId,
          messagePayload,
          accountInfo.bech32Address,
          targetAddress
        );
      } catch (e) {
        console.log(e);
        notification.push({
          type: "warning",
          placement: "top-center",
          duration: 5,
          content: `Failed to send selected Channel`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      }
    }
  };

  const cancel = async () => {
    try {
      await deliverMessages(
        user.accessToken,
        current.chainId,
        "/cancel",
        accountInfo.bech32Address,
        targetAddress
      );
    } catch (e) {
      console.log(e);
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Failed to cancel Operation`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  };

  const setChannel = async (
    channel: Channel,
    chainInfo: ChainInfoInner<ChainInfoWithCoreTypes>
  ) => {
    loadingIndicator.setIsLoading("set-channel", true);
    const destinationBlockHeight = queriesStore.get(channel.counterpartyChainId)
      .cosmos.queryRPCStatus;

    // Wait until fetching complete.
    await destinationBlockHeight.waitFreshResponse();

    if (
      destinationBlockHeight.latestBlockHeight === undefined ||
      destinationBlockHeight.latestBlockHeight.equals(new Int("0"))
    ) {
      throw new Error(
        `Failed to fetch the latest block of ${channel.counterpartyChainId}`
      );
    }

    setSelectedChannel({
      ...channel,
      counterPartyBech32Prefix: chainInfo.bech32Config.bech32PrefixAccAddr,
      revisionHeight: ChainIdHelper.parse(
        channel.counterpartyChainId
      ).version.toString(),
      revisionNumber: destinationBlockHeight.latestBlockHeight
        .add(new Int("150"))
        .toString(),
    });
    loadingIndicator.setIsLoading("set-channel", false);
  };
  return (
    <React.Fragment>
      <IBCChannelRegistrarModal
        isOpen={isIBCRegisterModalOpen}
        closeModal={() => setIsIBCregisterModalOpen(false)}
        toggle={() => setIsIBCregisterModalOpen((value) => !value)}
      />
      <FormGroup>
        <Label for={selectorId} style={{ width: "100%" }}>
          {label || (
            <FormattedMessage id="component.ibc.channel-registrar.chain-selector.label" />
          )}
        </Label>
        <ButtonDropdown
          disabled={disabled}
          id={selectorId}
          className={style.chainSelector}
          isOpen={isSelectorOpen}
          toggle={() => setIsSelectorOpen((value) => !value)}
        >
          <DropdownToggle caret>
            {selectedChannel ? (
              chainStore.getChain(selectedChannel.counterpartyChainId).chainName
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
                    onClick={async (e) => {
                      e.preventDefault();
                      await setChannel(channel, chainInfo);
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
        <Button
          type="button"
          color="primary"
          size="sm"
          style={{ marginTop: "15px" }}
          disabled={disabled || !selectedChannel}
          onClick={() => sendChannelDetails()}
        >
          Proceed
        </Button>
        <Button
          type="button"
          color="secondary"
          size="sm"
          style={{ marginTop: "15px" }}
          disabled={disabled}
          onClick={() => cancel()}
        >
          Cancel
        </Button>
      </FormGroup>
    </React.Fragment>
  );
});
