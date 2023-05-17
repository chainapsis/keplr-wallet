/* eslint-disable react-hooks/exhaustive-deps */
import { userChatAgents, userMessages } from "@chatStore/messages-slice";
import { userDetails } from "@chatStore/user-slice";
import { Chats, Groups } from "@chatTypes";
import { AgentDisclaimer } from "@components/agents/agents-disclaimer";
import { useNotification } from "@components/notification";
import { deliverMessages } from "@graphQL/messages-api";
import { recieveGroups, recieveMessages } from "@graphQL/recieve-messages";
import { useOnScreen } from "@hooks/use-on-screen";
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
import { AGENT_COMMANDS, CHAT_PAGE_COUNT } from "../../config.ui.var";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import {
  InactiveAgentMessage,
  InputField,
  ProcessingLastMessage,
} from "./input-section";
import { AgentChatMessage } from "@components/agent-chat-message";

export const ChatsViewSection = ({
  targetPubKey,
}: {
  targetPubKey: string;
  setLoadingChats: any;
}) => {
  const history = useHistory();
  const targetAddress = history.location.pathname.split("/")[3];

  const user = useSelector(userDetails);
  const userAgents: Groups = useSelector(userChatAgents);
  const userChats: Chats = useSelector(userMessages);

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const preLoadedChats = useMemo(() => {
    return (
      userChats[targetAddress] || {
        messages: {},
        pagination: { lastPage: 0, page: -1, pageCount: CHAT_PAGE_COUNT },
      }
    );
  }, [
    Object.values(userChats[targetAddress]?.messages || []).length,
    userChats[targetAddress]?.pagination,
  ]);
  const [messages, setMessages] = useState<any[]>(
    Object.values(preLoadedChats?.messages) || []
  );

  const [pagination, setPagination] = useState(preLoadedChats?.pagination);
  const group = Object.values(userAgents).find((group) =>
    group.id.includes(targetAddress)
  );

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isInputType2, setIsInputType2] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isCommand, setIsCommand] = useState(false);
  const [processingLastMessage, setProcessingLastMessage] = useState(false);
  const messagesStartRef: any = createRef();
  const messagesScrollRef: any = useRef(null);
  const isOnScreen = useOnScreen(messagesStartRef);
  const notification = useNotification();

  useEffect(() => {
    const updatedMessages = Object.values(preLoadedChats?.messages).sort(
      (a, b) => {
        return parseInt(a.commitTimestamp) - parseInt(b.commitTimestamp);
      }
    );

    setMessages(updatedMessages);
    setPagination(preLoadedChats.pagination);
  }, [preLoadedChats]);

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
    if (messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  }, [messagesEndRef.current]);

  useEffect(() => {
    const getChats = async () => {
      await loadUserList();
      if (pagination.page >= 0) messagesScrollRef.current?.scrollIntoView(true);
    };
    if (isOnScreen) getChats();
  }, [isOnScreen]);

  const loadUserList = async () => {
    if (loadingMessages) return;
    if (group) {
      const page = pagination?.page + 1 || 0;
      setLoadingMessages(true);
      await recieveMessages(targetAddress, null, page, group.isDm, group.id);
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

  useEffect(() => {
    if (
      messages.length &&
      messages[messages.length - 1].sender !== accountInfo.bech32Address
    )
      setProcessingLastMessage(false);
  }, [messages]);

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (
      isCommand &&
      !AGENT_COMMANDS.find(
        (command) => command.command == newMessage && command.enabled
      )
    ) {
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: "Following Command is not Recognised by Fetchbot",
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
      return;
    }

    if (isCommand && !user.hasFET) {
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: "Not Enough balance to execute automation",
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
      return;
    }
    if (newMessage.trim().length)
      try {
        const message = await deliverMessages(
          user.accessToken,
          current.chainId,
          newMessage,
          accountInfo.bech32Address,
          targetAddress
        );

        if (message) {
          const updatedMessagesList = [...messages, message];
          setMessages(updatedMessagesList);
          setNewMessage("");
          setProcessingLastMessage(true);
        }
        // scrollToBottom();
        recieveGroups(0, accountInfo.bech32Address);
      } catch (error) {
        console.log("failed to send : ", error);
      }
  };

  useEffect(() => {
    if (processingLastMessage) {
      const timer = setTimeout(() => {
        notification.push({
          type: "warning",
          placement: "top-center",
          duration: 5,
          content: `Taking more time than expected to process your request, Please try Later`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
        setProcessingLastMessage(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [processingLastMessage]);

  return (
    <div className={style.chatArea}>
      <AgentDisclaimer />
      <div className={style.messages}>
        {pagination?.lastPage <= pagination?.page && (
          <p>
            Messages are end to end encrypted. Nobody else can read them except
            you and the recipient.
          </p>
        )}
        {pagination?.lastPage > pagination?.page &&
          (pagination?.page === -1 ||
            messages.length === 30 ||
            messages.length == 0) && (
            <div ref={messagesStartRef} className={style.loader}>
              Fetching older Chats <i className="fas fa-spinner fa-spin ml-2" />
            </div>
          )}
        {messages?.map((message: any, index) => {
          const check = showDateFunction(message?.commitTimestamp);
          return (
            <div key={message.id}>
              {
                <AgentChatMessage
                  chainId={current.chainId}
                  showDate={check}
                  message={message?.contents}
                  messageId={message?.id}
                  isSender={message?.sender === accountInfo.bech32Address} // if I am the sender of this message
                  timestamp={message?.commitTimestamp || 1549312452}
                  groupLastSeenTimestamp={0}
                  disabled={messages.length - 1 > index}
                  setIsInputType2={setIsInputType2}
                />
              }
              {index === CHAT_PAGE_COUNT && <div ref={messagesScrollRef} />}
              <div ref={messagesEndRef} />
            </div>
          );
        })}
      </div>
      {!targetPubKey.length ? (
        <InactiveAgentMessage />
      ) : processingLastMessage ? (
        <ProcessingLastMessage />
      ) : (
        <InputField
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          setIsCommand={setIsCommand}
          handleSendMessage={handleSendMessage}
          disabled={isInputType2}
        />
      )}
    </div>
  );
};
