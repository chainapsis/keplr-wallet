import { MessagesStore } from "@keplr-wallet/stores/build/chat/message-store";
import { CHAT_PAGE_COUNT } from "../config.ui.var";
import { fetchGroups, fetchMessages } from "./messages-api";

export const recieveMessages = async (
  userAddress: string,
  afterTimestamp: string | null | undefined,
  page: number,
  _isDm: boolean,
  _groupId: string,
  accessToken: string,
  messageStore: MessagesStore
) => {
  const { messages, pagination } = await fetchMessages(
    _groupId,
    _isDm,
    afterTimestamp,
    page,
    accessToken
  );
  const messagesObj: any = {};
  if (messages) {
    messages.map((message: any) => {
      messagesObj[message.id] = message;
    });

    /// fetching the read records after unread to avoid the pagination stuck
    if (!!afterTimestamp) {
      const tmpPage = Math.floor(messages.length / CHAT_PAGE_COUNT);
      await recieveMessages(
        userAddress,
        null,
        tmpPage,
        _isDm,
        _groupId,
        accessToken,
        messageStore
      );
    }
    messageStore.updateChatList(userAddress, messagesObj, pagination);
  }
};

export const recieveGroups = async (
  page: number,
  userAddress: string,
  accessToken: string,
  messageStore: MessagesStore,
  addressQueryString: string = "",
  addressesList: string[] = []
) => {
  const { groups, pagination } = await fetchGroups(
    page,
    addressQueryString,
    addressesList,
    accessToken
  );
  const groupsObj: any = {};
  if (groups && groups.length) {
    groups.map((group: any) => {
      let contactAddress;

      if (group.isDm) {
        contactAddress =
          group.id.split("-")[0].toLowerCase() !== userAddress.toLowerCase()
            ? group.id.split("-")[0]
            : group.id.split("-")[1];
      } else {
        contactAddress = group.id;
      }
      groupsObj[contactAddress] = group;
    });
    messageStore.setGroups(groupsObj, pagination);
    messageStore.setIsChatGroupPopulated(true);
  }
};
