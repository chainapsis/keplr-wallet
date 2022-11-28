/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  AddressBookConfigMap,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { store } from "../../chatStore";
import {
  setMessageError,
  userChatStorePopulated,
  userChatSubscriptionActive,
} from "../../chatStore/messages-slice";
import {
  setAccessToken,
  setMessagingPubKey,
  userDetails,
} from "../../chatStore/user-slice";
import { ChatErrorPopup } from "../../components/chat-error-popup";
import { ChatLoader } from "../../components/chat-loader";
import { ChatInitPopup } from "../../components/chat/chat-init-popup";
import { ChatSearchInput } from "../../components/chat/chat-search-input";
import { DeactivatedChat } from "../../components/chat/deactivated-chat";
import { SwitchUser } from "../../components/switch-user";
import { EthereumEndpoint } from "../../config.ui";
import { AUTH_SERVER } from "../../config.ui.var";
import { fetchBlockList, messageListener } from "../../graphQL/messages-api";
import { recieveGroups } from "../../graphQL/recieve-messages";
import { HeaderLayout } from "../../layouts";
import { useStore } from "../../stores";
import { getJWT } from "../../utils/auth";
import { fetchPublicKey } from "../../utils/fetch-public-key";
import { Menu } from "../main/menu";
import style from "./style.module.scss";
import { ChatsGroupSection, NameAddress } from "./users";

const ChatView = () => {
  const userState = useSelector(userDetails);
  const chatStorePopulated = useSelector(userChatStorePopulated);
  const chatSubscriptionActive = useSelector(userChatSubscriptionActive);
  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountStore.getAccount(chainStore.current.chainId)
    .bech32Address;

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

  const [loadingChats, setLoadingChats] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [openDialog, setIsOpendialog] = useState(false);
  const [authFail, setAuthFail] = useState(false);

  const requester = new InExtensionMessageRequester();

  function debounce(func: any, timeout = 500) {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(args);
      }, timeout);
    };
  }

  const handleSearch = debounce(() => {
    const searchString = inputVal.trim();
    if (
      searchString.replace("fetch1", "").length > 2 &&
      !"fetch1".includes(searchString)
    ) {
      const addressesList = Object.keys(addresses).filter((contact) =>
        addresses[contact].toLowerCase().includes(searchString.toLowerCase())
      );
      recieveGroups(0, walletAddress, searchString, addressesList);
    }
  }, 1000);

  useEffect(() => {
    const getMessagesAndBlocks = async () => {
      setLoadingChats(true);
      try {
        if (!chatSubscriptionActive) messageListener();
        if (!chatStorePopulated) {
          await recieveGroups(0, walletAddress);
          await fetchBlockList();
        }
      } catch (e) {
        console.log("error loading messages", e);
        store.dispatch(
          setMessageError({
            type: "setup",
            message: "Something went wrong, Please try again in sometime.",
            level: 3,
          })
        );
        // Show error visually
      } finally {
        setLoadingChats(false);
      }
    };

    if (
      userState?.accessToken.length &&
      userState?.messagingPubKey.privacySetting &&
      userState?.messagingPubKey.publicKey &&
      walletAddress
    ) {
      getMessagesAndBlocks();
    }
  }, [
    userState.accessToken,
    userState.messagingPubKey.publicKey,
    userState.messagingPubKey.privacySetting,
    walletAddress,
  ]);

  useEffect(() => {
    const setJWTAndFetchMsgPubKey = async () => {
      setLoadingChats(true);
      try {
        const res = await getJWT(current.chainId, AUTH_SERVER);
        store.dispatch(setAccessToken(res));

        const pubKey = await fetchPublicKey(
          res,
          current.chainId,
          walletAddress
        );
        if (!pubKey || !pubKey.publicKey || !pubKey.privacySetting)
          return setIsOpendialog(true);

        store.dispatch(setMessagingPubKey(pubKey));
      } catch (e) {
        store.dispatch(
          setMessageError({
            type: "authorization",
            message: "Something went wrong, Message can't be delivered",
            level: 3,
          })
        );
        setAuthFail(true);
      }

      setLoadingChats(false);
    };

    if (
      !userState?.messagingPubKey.publicKey &&
      !userState?.messagingPubKey.privacySetting &&
      !userState?.accessToken.length &&
      !loadingChats &&
      !authFail
    ) {
      setJWTAndFetchMsgPubKey();
    }
  }, [
    current.chainId,
    loadingChats,
    requester,
    walletAddress,
    userState.accessToken.length,
    userState.messagingPubKey.publicKey,
    userState.messagingPubKey.privacySetting,
  ]);

  const [addresses, setAddresses] = useState<NameAddress>({});
  useEffect(() => {
    const configMap = new AddressBookConfigMap(
      new ExtensionKVStore("address-book"),
      chainStore
    );

    const addressBookConfig = configMap.getAddressBookConfig(selectedChainId);
    addressBookConfig.setSelectHandler({
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    });
    addressBookConfig.waitLoaded().then(() => {
      const addressList: NameAddress = {};
      addressBookConfig.addressBookDatas.map((data) => {
        addressList[data.address] = data.name;
      });
      setAddresses(addressList);
    });
  }, [selectedChainId]);

  if (
    userState.messagingPubKey.privacySetting &&
    userState.messagingPubKey.privacySetting === PrivacySetting.Nobody
  ) {
    return <DeactivatedChat />;
  }

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <ChatErrorPopup />
      <div className={style.chatContainer}>
        <ChatInitPopup
          openDialog={openDialog}
          setIsOpendialog={setIsOpendialog}
          setLoadingChats={setLoadingChats}
        />

        <div className={style.title}>Chats</div>
        <ChatSearchInput
          handleSearch={handleSearch}
          setSearchInput={setInputVal}
          searchInput={inputVal}
        />
        {loadingChats ? (
          <ChatLoader message="Loading chats, please wait..." />
        ) : (
          <ChatsGroupSection
            searchString={inputVal}
            setLoadingChats={setLoadingChats}
            chainId={current.chainId}
            addresses={addresses}
          />
        )}
      </div>
    </HeaderLayout>
  );
};

export const ChatPage: FunctionComponent = () => {
  return <ChatView />;
};
