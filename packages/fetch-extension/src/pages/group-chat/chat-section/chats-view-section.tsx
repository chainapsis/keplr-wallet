/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { AddressBookConfigMap } from "@keplr-wallet/hooks";
import { Chats, Group, Groups, GroupAddress, NameAddress } from "@chatTypes";
import { CHAT_PAGE_COUNT } from "../../../config.ui.var";
import { deliverGroupMessages } from "@graphQL/messages-api";
import { recieveGroups, recieveMessages } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { GroupMessageType } from "@utils/encrypt-group";
import { GroupChatMessage } from "@components/group-chat-message";
import { ChatInputSection } from "@components/chat-input-section";
import { observer } from "mobx-react-lite";

export const GroupChatsViewSection = observer(
  ({ isMemberRemoved }: { isMemberRemoved: boolean }) => {
    const groupId = useLocation().pathname.split("/")[3];
    const { chainStore, accountStore, chatStore } = useStore();

    let enterKeyCount = 0;

    const user = chatStore.userDetailsStore;
    const userGroups: Groups = chatStore.messagesStore.userChatGroups;

    const userChats: Chats = chatStore.messagesStore.userMessages;

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
    const messagesStartRef: any = createRef();
    const messagesScrollRef: any = useRef(null);
    const isOnScreen = useOnScreen(messagesStartRef);

    useEffect(() => {
      const updatedMessages = Object.values(preLoadedChats?.messages).sort(
        (a, b) => {
          return parseInt(a.commitTimestamp) - parseInt(b.commitTimestamp);
        }
      );

      setMessages(updatedMessages);
      setPagination(preLoadedChats.pagination);
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

      const init = async () => {
        /// receive last updated message as message subscription not called
        await recieveMessages(
          groupId,
          null,
          0,
          false,
          groupId,
          user.accessToken,
          chatStore.messagesStore
        );
      };
      if (currentUser?.removedAt) init();
    }, [userGroups]);

    const messagesEndRef: any = useCallback(
      (node: any) => {
        /// Wait 1 sec for design Rendering and then scroll
        if (node)
          setTimeout(() => {
            node.scrollIntoView({ block: "end" });
          }, 1000);
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
        if (pagination.page >= 0)
          messagesScrollRef.current.scrollIntoView(true);
      };
      if (isOnScreen) getChats();
    }, [isOnScreen]);

    useEffect(() => {
      const getChats = async () => {
        await loadUserList();
        if (pagination.page >= 0)
          messagesScrollRef.current.scrollIntoView(true);
      };
      getChats();
    }, []);

    const loadUserList = async () => {
      if (loadingMessages) return;
      if (group) {
        const page = pagination?.page + 1 || 0;
        setLoadingMessages(true);
        await recieveMessages(
          groupId,
          null,
          page,
          group.isDm,
          groupId,
          user.accessToken,
          chatStore.messagesStore
        );

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
          recieveGroups(
            0,
            accountInfo.bech32Address,
            user.accessToken,
            chatStore.messagesStore
          );
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
      <div className={style["chatArea"]}>
        <div className={style["messages"]}>
          {pagination?.lastPage > pagination?.page &&
            (pagination?.page === -1 ||
              messages.length === 30 ||
              messages.length == 0) && (
              <div ref={messagesStartRef} className={style["loader"]}>
                Fetching older Chats{" "}
                <i className="fas fa-spinner fa-spin ml-2" />
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
              </div>
            );
          })}
          <div ref={messagesEndRef} />
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
  }
);
