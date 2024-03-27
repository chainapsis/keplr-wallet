import { makeAutoObservable } from "mobx";
import { GROUP_PAGE_COUNT, CHAT_PAGE_COUNT } from "./constants";
import { Groups, Message } from "./message-types";
const initialState: any = {
  groups: {},
  agents: {},
  groupsPagination: {
    page: -1,
    pageCount: GROUP_PAGE_COUNT,
    lastPage: 0,
    total: GROUP_PAGE_COUNT,
  },
  chats: {},
  blockedAddress: {},
  isChatGroupPopulated: false,
  isChatSubscriptionActive: false,
};

export class MessagesStore {
  groups: any = {};
  agents: any = {};
  groupsPagination = {
    page: -1,
    pageCount: GROUP_PAGE_COUNT,
    lastPage: 0,
    total: GROUP_PAGE_COUNT,
  };
  chats: any = {};
  blockedAddress: any = {};
  errorMessage: any;
  isChatGroupPopulated = false;
  isChatSubscriptionActive = false;

  constructor() {
    makeAutoObservable(this);
  }

  setGroups(groups: any, pagination: any) {
    this.groupsPagination = pagination;

    const chatGroup = Object.keys(groups)
      .filter((key) => !key.includes("agent"))
      .reduce((obj: any, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});
    if (Object.keys(chatGroup).length > 0)
      this.groups = { ...this.groups, ...chatGroup };

    const chatAgent = Object.keys(groups)
      .filter((key) => key.includes("agent"))
      .reduce((obj: any, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});

    if (Object.keys(chatAgent).length > 0)
      this.agents = { ...this.agents, ...chatAgent };
  }

  updateChatList(userAddress: any, messages: any, pagination: any) {
    if (!this.chats[userAddress])
      this.chats[userAddress] = {
        contactAddress: userAddress,
        messages: {},
        pagination: {
          page: -1,
          pageCount: CHAT_PAGE_COUNT,
          lastPage: 0,
          total: CHAT_PAGE_COUNT,
        },
      };
    const newMessages = { ...this.chats[userAddress].messages, ...messages };
    this.chats[userAddress].messages = newMessages;
    this.chats[userAddress].pagination = pagination;
  }

  updateMessages(message: Message) {
    const { sender, id, groupId } = message;
    const tempId = groupId.split("-").length === 2 ? sender : groupId;

    if (!this.chats[tempId]) {
      this.chats[tempId] = {
        contactAddress: tempId,
        messages: {},
        pagination: {
          page: -1,
          pageCount: CHAT_PAGE_COUNT,
          lastPage: 0,
          total: CHAT_PAGE_COUNT,
        },
      };
    }

    this.chats[tempId].messages[id] = message;
  }

  updateGroupsData(group: any) {
    let key: string;
    if (group.isDm) {
      key = group?.userAddress;
    } else {
      key = group.id;
    }

    const updatedGroup = {
      [key]: group,
    };

    const chatGroup = Object.keys(updatedGroup)
      .filter((key) => !key.includes("agent"))
      .reduce((obj: Groups, key: string) => {
        obj[key] = updatedGroup[key];
        return obj;
      }, {});

    if (Object.keys(chatGroup).length > 0) {
      this.groups = { ...this.groups, ...chatGroup };
    }

    const chatAgent = Object.keys(updatedGroup)
      .filter((key) => key.includes("agent"))
      .reduce((obj: Groups, key: string) => {
        obj[key] = updatedGroup[key];
        return obj;
      }, {});

    if (Object.keys(chatAgent).length > 0) {
      this.agents = { ...this.agents, ...chatAgent };
    }
  }

  removeGroup(groupId: any) {
    if (this.groups.hasOwnProperty(groupId)) delete this.groups[groupId];
    if (this.agents.hasOwnProperty(groupId)) delete this.agents[groupId];
  }

  updateLatestSentMessage(message: Message) {
    const { target, id, groupId } = message;
    const tempId = groupId.split("-").length === 2 ? target : groupId;

    if (!this.chats[tempId]) {
      this.chats[tempId] = {
        contactAddress: tempId,
        messages: {},
        pagination: {
          page: 0,
          pageCount: CHAT_PAGE_COUNT,
          lastPage: 0,
          total: CHAT_PAGE_COUNT,
        },
      };
    }

    this.chats[tempId].messages[id] = message;
  }

  setBlockedList(blockedList: { blockedAddress: string }[]) {
    this.blockedAddress = {};
    blockedList.forEach(({ blockedAddress }) => {
      this.blockedAddress[blockedAddress] = true;
    });
  }

  setBlockedUser(payload: { blockedAddress: string }) {
    const { blockedAddress } = payload;
    this.blockedAddress[blockedAddress] = true;
  }

  setUnblockedUser(payload: { blockedAddress: string }) {
    const { blockedAddress } = payload;
    this.blockedAddress[blockedAddress] = false;
  }

  setMessageError(error: { type: string; message: string; level: number }) {
    this.errorMessage = error;
  }

  setIsChatGroupPopulated(value: boolean) {
    this.isChatGroupPopulated = value;
  }

  setIsChatSubscriptionActive(value: boolean) {
    this.isChatSubscriptionActive = value;
  }

  resetChatList() {
    Object.assign(this, initialState);
  }

  // Computed properties
  get userChatGroups() {
    return this.groups;
  }
  get userChatAgents() {
    return this.agents;
  }

  get userChatGroupPagination() {
    return this.groupsPagination;
  }

  get userMessages() {
    return this.chats;
  }
  get userMessagesError() {
    return this.errorMessage;
  }

  get userBlockedAddresses() {
    return this.blockedAddress;
  }

  get userChatSubscriptionActive() {
    return this.isChatSubscriptionActive;
  }

  get userChatStorePopulated() {
    return this.isChatGroupPopulated;
  }
}

export const messagesStore = new MessagesStore();
