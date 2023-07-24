import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BlockedAddressState,
  Chats,
  Groups,
  Message,
  Pagination,
} from "@chatTypes";
import { CHAT_PAGE_COUNT, GROUP_PAGE_COUNT } from "../../config.ui.var";

interface State {
  groups: Groups;
  agents: Groups;
  groupsPagination: Pagination;
  chats: Chats;
  blockedAddress: BlockedAddressState;
  errorMessage?: { type: string; message: string; level: number };
  isChatGroupPopulated: boolean;
  isChatSubscriptionActive: boolean;
}

const initialState: State = {
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

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setGroups: (state, action) => {
      const { groups, pagination } = action.payload;
      state.groupsPagination = pagination;

      const chatGroup = Object.keys(groups)
        .filter((key) => !key.includes("agent"))
        .reduce((obj: Groups, key: string) => {
          obj[key] = groups[key];
          return obj;
        }, {});
      if (Object.keys(chatGroup).length > 0)
        state.groups = { ...state.groups, ...chatGroup };

      const chatAgent = Object.keys(groups)
        .filter((key) => key.includes("agent"))
        .reduce((obj: Groups, key: string) => {
          obj[key] = groups[key];
          return obj;
        }, {});

      if (Object.keys(chatAgent).length > 0)
        state.agents = { ...state.agents, ...chatAgent };
    },
    updateChatList: (state, action) => {
      const { userAddress, messages, pagination } = action.payload;
      if (!state.chats[userAddress])
        state.chats[userAddress] = {
          contactAddress: userAddress,
          messages: {},
          pagination: {
            page: -1,
            pageCount: CHAT_PAGE_COUNT,
            lastPage: 0,
            total: CHAT_PAGE_COUNT,
          },
        };
      const newMessages = { ...state.chats[userAddress].messages, ...messages };
      state.chats[userAddress].messages = newMessages;
      state.chats[userAddress].pagination = pagination;
    },
    resetChatList: (_state, _action) => initialState,
    updateMessages: (state: any, action: PayloadAction<Message>) => {
      const { sender, id, groupId } = action.payload;
      /// Distinguish between Group and Single chat
      const tempId = groupId.split("-").length == 2 ? sender : groupId;
      if (!state.chats[tempId]) {
        state.chats[tempId] = {
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
      state.chats[tempId].messages[id] = action.payload;
    },
    updateGroupsData: (state: any, action: PayloadAction<any>) => {
      const group = action.payload;
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
      if (Object.keys(chatGroup).length > 0)
        state.groups = { ...state.groups, ...chatGroup };

      const chatAgent = Object.keys(updatedGroup)
        .filter((key) => key.includes("agent"))
        .reduce((obj: Groups, key: string) => {
          obj[key] = updatedGroup[key];
          return obj;
        }, {});
      if (Object.keys(chatAgent).length > 0)
        state.agents = { ...state.agents, ...chatAgent };
    },
    removeGroup: (state: any, action: PayloadAction<any>) => {
      const groupId = action.payload;
      if (state.groups.hasOwnProperty(groupId)) delete state.groups[groupId];
      if (state.agents.hasOwnProperty(groupId)) delete state.agents[groupId];
    },
    updateLatestSentMessage: (state: any, action: PayloadAction<Message>) => {
      const { target, id, groupId } = action.payload;
      /// Distinguish between Group and Single chat
      const tempId = groupId.split("-").length == 2 ? target : groupId;
      if (!state.chats[tempId]) {
        state.chats[tempId] = {
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
      state.chats[tempId].messages[id] = action.payload;
    },
    setBlockedList: (state, action) => {
      const blockedList = action.payload;
      state.blockedAddress = {};
      blockedList.map(({ blockedAddress }: { blockedAddress: string }) => {
        state.blockedAddress[blockedAddress] = true;
      });
    },
    setBlockedUser: (state, action) => {
      const { blockedAddress } = action.payload;
      state.blockedAddress[blockedAddress] = true;
    },
    setUnblockedUser: (state, action) => {
      const { blockedAddress } = action.payload;
      state.blockedAddress[blockedAddress] = false;
    },
    setMessageError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setIsChatGroupPopulated: (state, action) => {
      state.isChatGroupPopulated = action.payload;
    },
    setIsChatSubscriptionActive: (state, action) => {
      state.isChatSubscriptionActive = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setGroups,
  setMessageError,
  resetChatList,
  updateChatList,
  updateMessages,
  updateGroupsData,
  removeGroup,
  updateLatestSentMessage,
  setBlockedList,
  setBlockedUser,
  setUnblockedUser,
  setIsChatGroupPopulated,
  setIsChatSubscriptionActive,
} = messagesSlice.actions;

export const userChatGroups = (state: any) => state.messages.groups;
export const userChatAgents = (state: any) => state.messages.agents;
export const userChatGroupPagination = (state: any) =>
  state.messages.groupsPagination;

export const userMessages = (state: any) => state.messages.chats;
export const userMessagesError = (state: any) => state.messages.errorMessage;
export const userBlockedAddresses = (state: any) =>
  state.messages.blockedAddress;
export const userChatSubscriptionActive = (state: { messages: any }) =>
  state.messages.isChatSubscriptionActive;
export const userChatStorePopulated = (state: { messages: any }) =>
  state.messages.isChatGroupPopulated;
export const messageStore = messagesSlice.reducer;
