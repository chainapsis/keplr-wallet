/* eslint-disable react-hooks/exhaustive-deps */
import { RegisterPublicKey } from "@keplr-wallet/background/build/messaging";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { store } from "../../chatStore";
import {
  MessageMap,
  setMessageError,
  userMessages,
} from "../../chatStore/messages-slice";
import {
  setAccessToken,
  setMessagingPubKey,
  userDetails,
} from "../../chatStore/user-slice";
import { SwitchUser } from "../../components/switch-user";
import { EthereumEndpoint } from "../../config.ui";
import { AUTH_SERVER } from "../../config.ui.var";
import { fetchBlockList, messageListener } from "../../graphQL/messages-api";
import { recieveMessages } from "../../graphQL/recieve-messages";
import { HeaderLayout } from "../../layouts";
import newChatIcon from "../../public/assets/icon/new-chat.png";
import privacyIcon from "../../public/assets/hello.png";
import searchIcon from "../../public/assets/icon/search.png";
import { useStore } from "../../stores";
import { getJWT } from "../../utils/auth";
import { fetchPublicKey } from "../../utils/fetch-public-key";
import { Menu } from "../main/menu";
import style from "./style.module.scss";
import { NameAddress, Users } from "./users";
import { ChatLoader } from "../../components/chat-loader";
import { ChatErrorPopup } from "../../components/chat-error-popup";

const ChatView = () => {
  const userState = useSelector(userDetails);

  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountStore.getAccount(chainStore.current.chainId)
    .bech32Address;

  const history = useHistory();
  const messages = useSelector(userMessages);
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

  const [userChats, setUserChats] = useState<MessageMap | undefined>();
  const [loadingChats, setLoadingChats] = useState(true);
  const [inputVal, setInputVal] = useState("");
  const [openDialog, setIsOpendialog] = useState(false);

  const [
    selectedPrivacySetting,
    setSelectedPrivacySetting,
  ] = useState<PrivacySetting>(
    userState?.messagingPubKey.privacySetting
      ? userState?.messagingPubKey.privacySetting
      : PrivacySetting.Everybody
  );

  const requester = new InExtensionMessageRequester();

  const registerAndSetMessagePubKey = async () => {
    setLoadingChats(true);
    try {
      const messagingPubKey = await requester.sendMessage(
        BACKGROUND_PORT,
        new RegisterPublicKey(
          current.chainId,
          userState.accessToken,
          walletAddress,
          selectedPrivacySetting
        )
      );

      store.dispatch(setMessagingPubKey(messagingPubKey));
    } catch (e) {
      // Show error toaster
      console.error("error", e);
      store.dispatch(
        setMessageError({
          type: "setup",
          message: "Something went wrong, Please try again in sometime.",
          level: 3,
        })
      );
      // Redirect to home
      history.replace("/");
    } finally {
      setIsOpendialog(false);
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    const getMessagesAndBlocks = async () => {
      setLoadingChats(true);
      try {
        await messageListener();
        await recieveMessages(walletAddress);
        await fetchBlockList();
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
      }

      setLoadingChats(false);
    };

    if (
      !userState?.messagingPubKey.publicKey &&
      !userState?.messagingPubKey.privacySetting &&
      !userState?.accessToken.length &&
      !loadingChats
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

  const addresses: NameAddress = {};

  addressBookConfig.addressBookDatas.map((data) => {
    addresses[data.address] = data.name;
  });

  useEffect(() => {
    setLoadingChats(true);

    const userLastMessages: MessageMap = {};
    Object.keys(messages).map((contact: string) => {
      if (
        userState?.messagingPubKey.privacySetting === PrivacySetting.Contacts &&
        !addresses[contact]
      )
        return;

      userLastMessages[contact] = messages[contact].lastMessage;
    });

    setUserChats(userLastMessages);
    setLoadingChats(false);
  }, [messages]);

  const fillUserChats = () => {
    const userLastMessages: any = {};
    Object.keys(messages).map((contact: string) => {
      if (
        userState?.messagingPubKey.privacySetting === PrivacySetting.Contacts &&
        !addresses[contact]
      )
        return;

      userLastMessages[contact] = messages[contact].lastMessage;
    });
    setUserChats(userLastMessages);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputVal(value);

    if (value.trim()) {
      const userLastMessages: any = {};
      Object.keys(messages).map((contact: string) => {
        userLastMessages[contact] = messages[contact]?.lastMessage;
      });

      const filteredChats = Object.keys(userLastMessages).filter((contact) => {
        const found = Object.keys(addresses).some(
          (address) =>
            (addresses[address].toLowerCase().includes(value.toLowerCase()) ||
              address.toLowerCase().includes(value.toLowerCase())) &&
            address == contact
        );
        return (
          (userState?.messagingPubKey.privacySetting ===
            PrivacySetting.Everybody &&
            contact.toLowerCase().includes(value.toLowerCase())) ||
          found
        );
      });

      const tempChats: any = {};
      filteredChats.forEach((item: any) => {
        tempChats[item] = userLastMessages[item];
      });

      setUserChats(tempChats);
    } else {
      fillUserChats();
    }
  };

  if (
    userState.messagingPubKey.privacySetting &&
    userState.messagingPubKey.privacySetting === PrivacySetting.Nobody
  ) {
    return (
      <HeaderLayout
        showChainName={true}
        canChangeChainInfo={true}
        menuRenderer={<Menu />}
        rightRenderer={<SwitchUser />}
      >
        <div className={style.lockedInnerContainer}>
          <img
            className={style.imgLock}
            src={require("../../public/assets/img/icons8-lock.svg")}
            alt="lock"
          />

          <div>
            Chat is <b>deactivated</b> based on your current chat privacy
            settings. Please change your chat privacy settings to use this
            feature.
          </div>
          <br />
          <a
            href="#"
            style={{
              textDecoration: "underline",
            }}
            onClick={(e) => {
              e.preventDefault();
              history.push("/setting/chat/privacy");
            }}
          >
            Go to chat privacy settings
          </a>
        </div>
      </HeaderLayout>
    );
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
        {openDialog && userState.accessToken.length > 0 && (
          <>
            <div className={style.overlay} />
            <div className={style.popupContainer}>
              <img src={privacyIcon} />
              <br />
              <div className={style.infoContainer}>
                <h3>We have just added Chat!</h3>
                <p>Now you can chat with other active wallets.</p>
                <p>Select who can send you messages</p>
                <form>
                  <input
                    type="radio"
                    value={PrivacySetting.Everybody}
                    checked={
                      selectedPrivacySetting === PrivacySetting.Everybody
                    }
                    onChange={(e) =>
                      setSelectedPrivacySetting(
                        e.target.value as PrivacySetting
                      )
                    }
                  />
                  <label htmlFor="option1" className={style["options-label"]}>
                    Everybody
                  </label>
                  <br />
                  <input
                    type="radio"
                    value={PrivacySetting.Contacts}
                    checked={selectedPrivacySetting === PrivacySetting.Contacts}
                    onChange={(e) =>
                      setSelectedPrivacySetting(
                        e.target.value as PrivacySetting
                      )
                    }
                  />
                  <label htmlFor="option2" className={style["options-label"]}>
                    Only contacts in address book
                  </label>
                  <br />
                  <input
                    type="radio"
                    value={PrivacySetting.Nobody}
                    checked={selectedPrivacySetting === PrivacySetting.Nobody}
                    onChange={(e) =>
                      setSelectedPrivacySetting(
                        e.target.value as PrivacySetting
                      )
                    }
                  />
                  <label htmlFor="option3" className={style["options-label"]}>
                    Nobody
                  </label>
                  <br />
                </form>
                <p>
                  These settings can be changed at any time from the settings
                  menu.
                </p>
              </div>
              <button type="button" onClick={registerAndSetMessagePubKey}>
                Continue
              </button>
            </div>
          </>
        )}

        <div className={style.title}>Chats</div>
        <div className={style.searchContainer}>
          <div className={style.searchBox}>
            <img src={searchIcon} alt="search" />
            <input
              placeholder="Search by name or address"
              value={inputVal}
              onChange={handleSearch}
            />
          </div>
          <div onClick={() => history.push("/newChat")}>
            <img style={{ cursor: "pointer" }} src={newChatIcon} alt="" />
          </div>
        </div>

        {!addressBookConfig.isLoaded || loadingChats || !userChats ? (
          <ChatLoader message="Loading chats, please wait..." />
        ) : (
          <Users
            chainId={current.chainId}
            userChats={userChats}
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
