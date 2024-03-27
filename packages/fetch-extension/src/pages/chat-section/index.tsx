/* eslint-disable react-hooks/exhaustive-deps */
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ChatActionsPopup } from "@components/chat-actions-popup";
import { ChatErrorPopup } from "@components/chat-error-popup";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import { useStore } from "../../stores";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { Menu } from "../main/menu";
import { ChatActionsDropdown } from "@components/chat-actions-dropdown";
import { ChatsViewSection } from "./chats-view-section";
import { UserNameSection } from "./username-section";
import { observer } from "mobx-react-lite";

export const ChatSection: FunctionComponent = observer(() => {
  const targetAddress = useLocation().pathname.split("/")[2];
  const { chainStore, accountStore, queriesStore, uiConfigStore, chatStore } =
    useStore();

  const user = chatStore.userDetailsStore;
  const blockedUsers = chatStore.messagesStore.blockedAddress;
  const [targetPubKey, setTargetPubKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);
  const [action, setAction] = useState("");
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  // address book values
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
  );

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );

  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );
  const addresses = addressBookConfig.addressBookDatas;

  const contactName = (addresses: any) => {
    let val = "";
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].address == targetAddress) {
        val = addresses[i].name;
      }
    }
    return val;
  };

  const handleDropDown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClick = (data: string) => {
    setAction(data);
    setConfirmAction(true);
    setShowDropdown(false);
  };

  useEffect(() => {
    const setPublicAddress = async () => {
      const pubAddr = await fetchPublicKey(
        user.accessToken,
        current.chainId,
        targetAddress
      );
      setTargetPubKey(pubAddr?.publicKey || "");
    };
    setPublicAddress();
  }, [user.accessToken, current.chainId, targetAddress]);

  const isNewUser = (): boolean => {
    const addressExists = addresses.find(
      (item: any) => item.address === targetAddress
    );
    return !Boolean(addressExists);
  };

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <ChatErrorPopup />
      <div onClick={() => setShowDropdown(false)}>
        <UserNameSection
          handleDropDown={handleDropDown}
          addresses={addresses}
        />
        <ChatActionsDropdown
          added={contactName(addresses).length > 0}
          showDropdown={showDropdown}
          handleClick={handleClick}
          blocked={blockedUsers[targetAddress]}
        />

        <ChatsViewSection
          isNewUser={isNewUser()}
          isBlocked={blockedUsers[targetAddress]}
          targetPubKey={targetPubKey}
          handleClick={handleClick}
        />

        {confirmAction && (
          <ChatActionsPopup
            action={action}
            setConfirmAction={setConfirmAction}
          />
        )}
      </div>
    </HeaderLayout>
  );
});
