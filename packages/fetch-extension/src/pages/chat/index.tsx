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
import { NameAddress } from "@chatTypes";
import { ChatErrorPopup } from "@components/chat-error-popup";
import { ChatLoader } from "@components/chat-loader";
import { ChatInitPopup } from "@components/chat/chat-init-popup";
import { ChatSearchInput } from "@components/chat/chat-search-input";
import { DeactivatedChat } from "@components/chat/deactivated-chat";
import { SwitchUser } from "@components/switch-user";
import { AUTH_SERVER } from "../../config.ui.var";
import {
  fetchBlockList,
  groupsListener,
  messageListener,
} from "@graphQL/messages-api";
import { recieveGroups } from "@graphQL/recieve-messages";
import { HeaderLayout } from "@layouts/index";
import { useStore } from "../../stores";
import { getJWT } from "@utils/auth";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { Menu } from "../main/menu";
import { AgentsHistory } from "./agent-history";
import { GroupsHistory } from "./group-history";
import style from "./style.module.scss";
import { ToolTip } from "@components/tooltip";
import { useLocation } from "react-router";
import { observer } from "mobx-react-lite";

const ChatView = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    analyticsStore,
    chatStore,
  } = useStore();
  const userState = chatStore.userDetailsStore;
  const chatStorePopulated = chatStore.messagesStore.userChatStorePopulated;
  const chatSubscriptionActive =
    chatStore.messagesStore.userChatSubscriptionActive;

  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;

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
  const location: any = useLocation();
  const selectedTabState = location?.search;

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );
  const [loadingChats, setLoadingChats] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [openDialog, setIsOpendialog] = useState(false);
  const [authFail, setAuthFail] = useState(false);
  const [selectedTab, setSelectedTab] = useState(selectedTabState ? 2 : 1);

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

  const handleSearch = debounce(async () => {
    const searchString = inputVal.trim();
    if (
      searchString.replace("fetch1", "").length > 2 &&
      !"fetch1".includes(searchString)
    ) {
      const addressesList = Object.keys(addresses).filter((contact) =>
        addresses[contact].toLowerCase().includes(searchString.toLowerCase())
      );
      await recieveGroups(
        0,
        walletAddress,
        userState.accessToken,
        chatStore.messagesStore,
        searchString,
        addressesList
      );
    }
  }, 1000);

  useEffect(() => {
    const getMessagesAndBlocks = async () => {
      setLoadingChats(true);
      try {
        if (!chatSubscriptionActive) {
          groupsListener(
            walletAddress,
            userState.accessToken,
            chatStore.messagesStore
          );
          messageListener(
            walletAddress,
            userState.accessToken,
            chatStore.messagesStore
          );
        }
        if (!chatStorePopulated) {
          await recieveGroups(
            0,
            walletAddress,
            userState.accessToken,
            chatStore.messagesStore
          );
          const list = await fetchBlockList(userState.accessToken);
          chatStore.messagesStore.setBlockedList(list);
        }
      } catch (e) {
        console.log("error loading messages", e);
        chatStore.messagesStore.setMessageError({
          type: "authorization",
          message: "Something went wrong, Please try again in sometime.",
          level: 3,
        });
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
        userState.setAccessToken(res);

        const pubKey = await fetchPublicKey(
          res,
          current.chainId,
          walletAddress
        );
        if (!pubKey || !pubKey.publicKey || !pubKey.privacySetting)
          return setIsOpendialog(true);
        userState.setMessagingPubKey(pubKey);
      } catch (e) {
        chatStore.messagesStore.setMessageError({
          type: "authorization",
          message: "Something went wrong, Message can't be delivered",
          level: 3,
        });
        setAuthFail(true);
      }

      setLoadingChats(false);
    };

    if (
      !userState?.messagingPubKey.publicKey &&
      !userState?.messagingPubKey.privacySetting &&
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
    userState.messagingPubKey.chatReadReceiptSetting,
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

  useEffect(() => {
    analyticsStore.logEvent(
      selectedTab == 1 ? "people_tab_click" : "agents_tab_click",
      { pageName: "Chat Tab" }
    );
  }, [selectedTab]);

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
      <div className={style["chatContainer"]}>
        {openDialog && userState.accessToken.length > 0 && (
          <ChatInitPopup
            setIsOpendialog={setIsOpendialog}
            setLoadingChats={setLoadingChats}
          />
        )}

        <div className={style["title"]}>Chats</div>
        <ChatSearchInput
          handleSearch={handleSearch}
          setSearchInput={setInputVal}
          searchInput={inputVal}
        />
        <div className={style["chatTabList"]}>
          <div
            className={style["chatTab"]}
            style={{
              borderBottom: selectedTab == 1 ? "2px solid #D43BF6" : "",
              color: selectedTab == 1 ? "#D43BF6" : "#000000",
            }}
            onClick={() => setSelectedTab(1)}
          >
            People
          </div>

          <div
            className={style["chatTab"]}
            style={{
              borderBottom: selectedTab == 2 ? "2px solid #3B82F6" : "",
              color: selectedTab == 2 ? "#3B82F6" : "#000000",
            }}
            onClick={() =>
              userState?.walletConfig?.fetchbotActive ? setSelectedTab(2) : {}
            }
          >
            {userState?.walletConfig?.fetchbotActive &&
            userState?.enabledChainIds.includes(current.chainId) ? (
              "Agents"
            ) : (
              <ToolTip
                trigger="hover"
                options={{ placement: "bottom" }}
                tooltip={<div>Coming Soon</div>}
              >
                Agents
              </ToolTip>
            )}
          </div>
        </div>
        {loadingChats ? (
          <ChatLoader message="Loading chats, please wait..." />
        ) : selectedTab == 1 ? (
          <GroupsHistory
            searchString={inputVal}
            setLoadingChats={setLoadingChats}
            chainId={current.chainId}
            addresses={addresses}
          />
        ) : (
          <AgentsHistory
            searchString={inputVal}
            setLoadingChats={setLoadingChats}
            chainId={current.chainId}
            addresses={addresses}
          />
        )}
      </div>
    </HeaderLayout>
  );
});

export const ChatPage: FunctionComponent = () => {
  return <ChatView />;
};
