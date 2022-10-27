/* eslint-disable react-hooks/exhaustive-deps */
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Input, InputGroup } from "reactstrap";
import {
  userBlockedAddresses,
  userMessages,
} from "../../chatStore/messages-slice";
import { userDetails } from "../../chatStore/user-slice";
import { ChatMessage } from "../../components/chatMessage";
import { SwitchUser } from "../../components/switch-user";
import { ToolTip } from "../../components/tooltip";
import { EthereumEndpoint } from "../../config.ui";
import { deliverMessages } from "../../graphQL/messages-api";
import { HeaderLayout } from "../../layouts";
import chevronLeft from "../../public/assets/icon/chevron-left.png";
import moreIcon from "../../public/assets/icon/more-grey.png";
import paperAirplaneIcon from "../../public/assets/icon/paper-airplane.png";
import { useStore } from "../../stores";
import { fetchPublicKey } from "../../utils/fetch-public-key";
import { formatAddress } from "../../utils/format";
import { Menu } from "../main/menu";
import { Dropdown } from "./chat-actions-popup";
import style from "./style.module.scss";
import TextareaAutosize from "react-textarea-autosize";
import { useNotification } from "../../components/notification";
import { useIntl } from "react-intl";
import { ChatLoader } from "../../components/chat-loader";
import { ActionsPopup } from "./actions-popup";
import { ChatErrorPopup } from "../../components/chat-error-popup";

export let openValue = true;

export const ChatSection: FunctionComponent = () => {
  const history = useHistory();
  const notification = useNotification();
  const intl = useIntl();
  const userName = history.location.pathname.split("/")[2];
  const allMessages = useSelector(userMessages);
  const blockedUsers = useSelector(userBlockedAddresses);
  const oldMessages = useMemo(() => allMessages[userName] || {}, [
    allMessages,
    userName,
  ]);
  const [messages, setMessages] = useState(
    Object.values(oldMessages?.messages || [])
  );
  const user = useSelector(userDetails);

  const [newMessage, setNewMessage] = useState("");
  const [targetPubKey, setTargetPubKey] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);
  const [action, setAction] = useState("");
  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const messagesEndRef: any = useCallback(
    (node: any) => {
      if (node) node.scrollIntoView(true);
    },
    [messages]
  );

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

  // console.log("####", addressBookConfig.waitLoaded())

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

  const getDateValue = (d: any) => {
    const date = new Date(d);
    return date.getDate();
  };
  let prevDate = 0;
  const showDateFunction = (d: any) => {
    const date = getDateValue(d);

    if (prevDate !== date) {
      prevDate = date;
      return true;
    }
    return false;
  };

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (newMessage.trim().length)
      try {
        const message = await deliverMessages(
          user.accessToken,
          current.chainId,
          newMessage,
          accountInfo.bech32Address,
          userName
        );
        if (message) setNewMessage("");
      } catch (error) {
        console.log("failed to send : ", error);
      }
  };

  const handleKeydown = (e: { keyCode: number }) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      handleSendMessage(e);
    }
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
    if (!oldMessages?.pubKey?.length) {
      setPublicAddress();
    }
  }, [oldMessages, user.accessToken, current.chainId, userName]);

  useEffect(() => {
    if (
      oldMessages?.lastMessage?.id &&
      !messages?.find(
        (message: any) => message?.id === oldMessages?.lastMessage?.id
      )
    ) {
      const newMessages = [...messages, oldMessages?.lastMessage];
      setMessages(newMessages);
    }
  }, [oldMessages, messages]);

  // const scrollToBottom = () => {
  //   messagesEndRef.current && messagesEndRef.current.scrollIntoView(true);
  // };

  const isNewUser = (): boolean => {
    const addressExists = addresses.find(
      (item: any) => item.address === userName
    );
    return !Boolean(addressExists) && messages.length === 0;
  };
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.address.copied",
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <ChatErrorPopup />
      {!addressBookConfig.isLoaded ? (
        <ChatLoader message="Arranging messages, please wait..." />
      ) : (
        <div>
          <div className={style.username}>
            <div className={style.leftBox}>
              <img
                alt=""
                className={style.backBtn}
                src={chevronLeft}
                onClick={() => {
                  history.goBack();
                  openValue = false;
                }}
              />
              <span className={style.recieverName}>
                <ToolTip
                  tooltip={
                    <div className={style.user} style={{ minWidth: "300px" }}>
                      {contactName(addresses).length
                        ? contactName(addresses)
                        : userName}
                    </div>
                  }
                  theme="dark"
                  trigger="hover"
                  options={{
                    placement: "top",
                  }}
                >
                  {contactName(addresses).length
                    ? formatAddress(contactName(addresses))
                    : formatAddress(userName)}
                </ToolTip>
              </span>
              <span
                className={style.copyIcon}
                onClick={() => copyAddress(userName)}
              >
                <i className="fas fa-copy" />
              </span>
            </div>
            <div className={style.rightBox}>
              <img
                alt=""
                style={{ cursor: "pointer" }}
                className={style.more}
                src={moreIcon}
                onClick={handleDropDown}
                onBlur={handleDropDown}
              />
            </div>
          </div>

          <Dropdown
            added={contactName(addresses).length > 0}
            showDropdown={showDropdown}
            // setShowDropdown={setShowDropdown}
            handleClick={handleClick}
            blocked={blockedUsers[userName]}
          />

          {isNewUser() && (
            <div className={style.contactsContainer}>
              <div className={style.displayText}>
                This contact is not saved in your address book
              </div>
              <div className={style.buttons}>
                <button
                  style={{ padding: "4px 20px" }}
                  onClick={() =>
                    history.push({
                      pathname: "/setting/address-book",
                      state: {
                        openModal: true,
                        addressInputValue: userName,
                      },
                    })
                  }
                >
                  Add
                </button>
                {blockedUsers[userName] ? (
                  <button onClick={() => handleClick("unblock")}>
                    Unblock
                  </button>
                ) : (
                  <button onClick={() => handleClick("block")}>Block</button>
                )}
              </div>
            </div>
          )}

          <div
            className={`${style.chatArea} ${
              isNewUser() ? style.showButton : style.hideButton
            }`}
          >
            <div className={style.messages}>
              <p>
                Messages are end to end encrypted. Nobody else can read them
                except you and the recipient.
              </p>
              {messages
                ?.sort((a: any, b: any) => {
                  return a.commitTimestamp - b.commitTimestamp;
                })
                ?.map((message: any, index) => {
                  const check = showDateFunction(message?.commitTimestamp);
                  return (
                    <ChatMessage
                      key={index}
                      chainId={current.chainId}
                      showDate={check}
                      message={message?.contents}
                      isSender={message?.target === userName} // if target was the user we are chatting with
                      timestamp={message?.commitTimestamp || 1549312452}
                    />
                  );
                })}
              <div ref={messagesEndRef} className={style.messageRef} />
            </div>
            <InputGroup className={style.inputText}>
              {targetPubKey.length ? (
                <TextareaAutosize
                  maxRows={3}
                  className={`${style.inputArea} ${style["send-message-inputArea"]}`}
                  placeholder={
                    blockedUsers[userName]
                      ? "This contact is blocked"
                      : "Type a new message..."
                  }
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={handleKeydown}
                  disabled={blockedUsers[userName]}
                />
              ) : (
                <ToolTip
                  trigger="hover"
                  options={{ placement: "top" }}
                  tooltip={
                    <div>No transaction history found for this user</div>
                  }
                >
                  <Input
                    className={`${style.inputArea} ${style["send-message-inputArea"]}`}
                    placeholder="Type a new message..."
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={handleKeydown}
                    disabled={true}
                  />
                </ToolTip>
              )}
              {newMessage?.length && newMessage.trim() !== "" ? (
                <div
                  className={style["send-message-icon"]}
                  onClick={handleSendMessage}
                >
                  <img src={paperAirplaneIcon} alt="" />
                </div>
              ) : (
                ""
              )}
            </InputGroup>
          </div>
          {confirmAction && (
            <ActionsPopup action={action} setConfirmAction={setConfirmAction} />
          )}
        </div>
      )}
    </HeaderLayout>
  );
};
