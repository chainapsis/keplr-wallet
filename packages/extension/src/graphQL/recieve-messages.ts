import { store } from "../chatStore";
import { addMessageList } from "../chatStore/messages-slice";
import { fetchMessages } from "./messages-api";

export const recieveMessages = async (userAddress: string) => {
  const messagesArray = await fetchMessages();
  const messageStore: any = {};
  messagesArray.map((message: any) => {
    const contactAddress =
      message.sender === userAddress ? message.target : message.sender;
    // const contactAddress = message.target
    if (!messageStore[contactAddress])
      messageStore[contactAddress] = {
        messages: {},
        lastMessage: { commitTimestamp: 0 },
      };
    messageStore[contactAddress].messages[message.id] = message;
    messageStore[contactAddress].lastMessage = findLastMessage(
      message,
      messageStore[contactAddress].lastMessage
    );
  });
  store.dispatch(addMessageList(messageStore));
};

export const findLastMessage = (newMessage: any, lastMessage: any) => {
  if (newMessage.commitTimestamp > lastMessage.commitTimestamp)
    return newMessage;
  return lastMessage;
};
