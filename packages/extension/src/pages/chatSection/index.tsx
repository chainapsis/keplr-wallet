/* eslint-disable react-hooks/exhaustive-deps */
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { userBlockedAddresses } from "../../chatStore/messages-slice";
import { userDetails } from "../../chatStore/user-slice";
import { ChatErrorPopup } from "../../components/chat-error-popup";
import { ChatLoader } from "../../components/chat-loader";
import { SwitchUser } from "../../components/switch-user";
import { EthereumEndpoint } from "../../config.ui";
import { HeaderLayout } from "../../layouts";
import { useStore } from "../../stores";
import { fetchPublicKey } from "../../utils/fetch-public-key";
import { Menu } from "../main/menu";
import { ActionsPopup } from "./actions-popup";
import { Dropdown } from "./chat-actions-popup";
import { ChatsViewSection } from "./chats-view-section";
import { UserNameSection } from "./username-section";

export const openValue = true;
export const ChatSection: FunctionComponent = () => {
  const history = useHistory();
  const userName = history.location.pathname.split("/")[2];

  const blockedUsers = useSelector(userBlockedAddresses);
  const user = useSelector(userDetails);

  const [targetPubKey, setTargetPubKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [action, setAction] = useState("");
  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  // address book values
  const queries = queriesStore.get(chainStore.current.chainId);
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.ibcTransfer,
    accountInfo.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
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
      if (addresses[i].address == userName) {
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
        userName
      );
      setTargetPubKey(pubAddr?.publicKey || "");
    };
    setPublicAddress();
  }, [user.accessToken, current.chainId, userName]);

  const isNewUser = (): boolean => {
    const addressExists = addresses.find(
      (item: any) => item.address === userName
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
      {loadingChats ? (
        <ChatLoader message="Arranging messages, please wait..." />
      ) : (
        <div>
          <UserNameSection
            handleDropDown={handleDropDown}
            addresses={addresses}
          />
          <Dropdown
            added={contactName(addresses).length > 0}
            showDropdown={showDropdown}
            handleClick={handleClick}
            blocked={blockedUsers[userName]}
          />

          <ChatsViewSection
            isNewUser={isNewUser()}
            isBlocked={blockedUsers[userName]}
            targetPubKey={targetPubKey}
            setLoadingChats={setLoadingChats}
            handleClick={handleClick}
          />

          {confirmAction && (
            <ActionsPopup action={action} setConfirmAction={setConfirmAction} />
          )}
        </div>
      )}
    </HeaderLayout>
  );
};
