/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { AddressBookConfigMap } from "@keplr-wallet/hooks";
import { Chats, Group, Groups, GroupAddress, NameAddress } from "@chatTypes";
import { userChatGroups, userMessages } from "@chatStore/messages-slice";
import { userDetails } from "@chatStore/user-slice";
import { CHAT_PAGE_COUNT } from "../../../config.ui.var";
import { deliverGroupMessages } from "@graphQL/messages-api";
import { recieveGroups, recieveMessages } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { GroupMessageType } from "@utils/encrypt-group";
import { GroupChatMessage } from "@components/group-chat-message";
import { ChatInputSection } from "@components/chat-input-section";

export const GroupChatsViewSection = ({
  isMemberRemoved,
}: {
  isMemberRemoved: boolean;
}) => {
  const history = useHistory();
  const groupId = history.location.pathname.split("/")[3];

  let enterKeyCount = 0;
  const user = useSelector(userDetails);
  const userGroups: Groups = useSelector(userChatGroups);
  const userChats: Chats = useSelector(userMessages);

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [addresses, setAddresses] = useState<NameAddress>({});
  useEffect(() => {
    const configMap = new AddressBookConfigMap(
      new ExtensionKVStore("address-book"),
      chainStore
    );

    const addressBookConfig = configMap.getAddressBookConfig(current.chainId);
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
  }, [current.chainId]);

  const preLoadedChats = useMemo(() => {
    return (
      userChats[groupId] || {
        messages: {},
        pagination: { lastPage: 0, page: -1, pageCount: CHAT_PAGE_COUNT },
      }
    );
  }, [Object.values(userChats[groupId]?.messages || []).length]);
  const [messages, setMessages] = useState<any[]>(
    Object.values(preLoadedChats?.messages) || []
  );

  const [pagination, setPagination] = useState(preLoadedChats?.pagination);
  const [group, setGroup] = useState<Group | undefined>(
    Object.values(userGroups).find((group) => group.id.includes(groupId))
  );
  const [userGroupAddress, setUserGroupAddress] = useState<
    GroupAddress | undefined
  >();
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [newMessage, setNewMessage] = useState("");

  //Scrolling Logic
  // const messagesEndRef: any = useRef();
  const messagesStartRef: any = createRef();
  const messagesScrollRef: any = useRef(null);
  const isOnScreen = useOnScreen(messagesStartRef);

  // const scrollToBottom = () => {
  //   if (messagesEndRef.current) messagesEndRef.current.scrollIntoView(true);
  // };

  useEffect(() => {
    const updatedMessages = Object.values(preLoadedChats?.messages).sort(
      (a, b) => {
        return parseInt(a.commitTimestamp) - parseInt(b.commitTimestamp);
      }
    );

    setMessages(updatedMessages);
    setPagination(preLoadedChats.pagination);

    // const lastMessage =
    //   updatedMessages && updatedMessages.length > 0
    //     ? updatedMessages[updatedMessages.length - 1]
    //     : null;

    // if (
    //   group?.id &&
    //   lastMessage &&
    //   lastMessage.sender !== accountInfo.bech32Address
    // ) {
    //   setTimeout(() => {
    //     updateGroupTimestamp(
    //       group?.id,
    //       user.accessToken,
    //       current.chainId,
    //       accountInfo.bech32Address,
    //       groupId,
    //       new Date(lastMessage.commitTimestamp),
    //       new Date(lastMessage.commitTimestamp)
    //     );
    //   }, 500);
    // }
  }, [preLoadedChats]);

  useEffect(() => {
    const groupData = Object.values(userGroups).find((group) =>
      group.id.includes(groupId)
    );
    setGroup(groupData);

    const currentUser = groupData?.addresses.find(
      (element) => element.address === accountInfo.bech32Address
    );
    setUserGroupAddress(currentUser);

    if (currentUser?.removedAt) {
      /// receive last updated message as message subscription not called
      recieveMessages(groupId, null, 0, false, groupId);
    }
  }, [userGroups]);

  const messagesEndRef: any = useCallback(
    (node: any) => {
      if (node) node.scrollIntoView({ block: "end" });
    },
    [messages]
  );

  useEffect(() => {
    if (isMemberRemoved && newMessage.length > 0) {
      setNewMessage("");
    }
  }, [isMemberRemoved]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView(true);
    }
  }, [messagesEndRef.current]);

  useEffect(() => {
    const getChats = async () => {
      await loadUserList();
      // if (pagination.page < 0) scrollToBottom();
      // else messagesScrollRef.current.scrollIntoView(true);
      if (pagination.page >= 0) messagesScrollRef.current.scrollIntoView(true);
    };
    if (isOnScreen) getChats();
  }, [isOnScreen]);

  const loadUserList = async () => {
    if (loadingMessages) return;
    if (group) {
      const page = pagination?.page + 1 || 0;
      setLoadingMessages(true);
      await recieveMessages(groupId, null, page, group.isDm, groupId);
      setLoadingMessages(false);
    } else {
      const newPagination = pagination;
      newPagination.page = pagination.lastPage;
      setPagination(newPagination);
    }
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
    if (newMessage.trim().length && userGroupAddress)
      try {
        // get encryptedsymmetrickey as well as parameter
        const { encryptedSymmetricKey } = userGroupAddress;
        const message = await deliverGroupMessages(
          user.accessToken,
          current.chainId,
          newMessage,
          encryptedSymmetricKey || "",
          GroupMessageType.message,
          accountInfo.bech32Address,
          groupId
        );

        if (message) {
          const updatedMessagesList = [...messages, message];
          setMessages(updatedMessagesList);
          setNewMessage("");
        }
        // scrollToBottom();
        recieveGroups(0, accountInfo.bech32Address);
      } catch (error) {
        console.log("failed to send : ", error);
      } finally {
        enterKeyCount = 0;
      }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //it triggers by pressing the enter key
    const { key } = e as React.KeyboardEvent<HTMLTextAreaElement>;
    if (key === "Enter" && !e.shiftKey && enterKeyCount == 0) {
      enterKeyCount = 1;
      handleSendMessage(e);
    }
  };

  return (
    <div className={style.chatArea}>
      <div className={style.messages}>
        {pagination?.lastPage > pagination?.page &&
          (pagination?.page === -1 ||
            messages.length === 30 ||
            messages.length == 0) && (
            <div ref={messagesStartRef} className={style.loader}>
              Fetching older Chats <i className="fas fa-spinner fa-spin ml-2" />
            </div>
          )}
        {pagination?.lastPage <= pagination?.page && (
          <p>
            {` Messages are end to end encrypted. Nobody else can read them except
            you and the recipient${
              group && group?.addresses.length > 2 ? "s" : ""
            }.`}
          </p>
        )}
        {messages?.map((message: any, index) => {
          const isShowDate = showDateFunction(message?.commitTimestamp);
          if (!group) return;
          const groupAddresses = group.addresses;
          const userGroupAddress = groupAddresses.find(
            (address) => address.address == accountInfo.bech32Address
          );
          const encryptedSymmetricKey =
            userGroupAddress?.encryptedSymmetricKey || "";

          return (
            <div key={message.id}>
              <GroupChatMessage
                chainId={current.chainId}
                encryptedSymmetricKey={encryptedSymmetricKey}
                addresses={addresses}
                senderAddress={message?.sender}
                showDate={isShowDate}
                message={message?.contents}
                isSender={message?.sender === accountInfo.bech32Address} // if I am the sender of this message
                timestamp={message?.commitTimestamp || 1549312452}
                groupLastSeenTimestamp={0}
              />
              {index === CHAT_PAGE_COUNT && <div ref={messagesScrollRef} />}
              {/* {message?.commitTimestamp &&
                receiver?.lastSeenTimestamp &&
                Number(message?.commitTimestamp) >
                  Number(receiver?.lastSeenTimestamp) &&
                message?.sender === targetAddress && (
                  <div ref={messagesEndRef} className={messagesEndRef} />
                )} */}
            </div>
          );
        })}
        <div ref={messagesEndRef} className={"AAAAA"} />
      </div>
      <ChatInputSection
        placeholder={
          isMemberRemoved
            ? "You can't send messages to this group because you're no longer a participant"
            : "Type a new message..."
        }
        value={newMessage}
        onChange={(event) => {
          setNewMessage(event.target.value.substring(0, 499));
        }}
        onClick={handleSendMessage}
        onKeyDown={handleKeydown}
        disabled={isMemberRemoved}
      />
    </div>
  );
};
