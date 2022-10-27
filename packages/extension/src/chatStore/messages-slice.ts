import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../graphQL/messages-queries";

export interface MessageMap {
  [key: string]: Message;
}

interface ContactState {
  messageList: MessageMap;
  lastMessage?: Message;
  pubKey?: string;
}

interface MessagesState {
  [key: string]: ContactState;
}

interface BlockedAddressState {
  [key: string]: boolean;
}

interface PubKey {
  contact: string;
  value: string;
}

interface State {
  chat: MessagesState;
  blockedAddress: BlockedAddressState;
  errorMessage?: { type: string; message: string; level: number };
}

const initialState: State = { chat: {}, blockedAddress: {} };

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessageList: (state, action) => {
      state.chat = action.payload;
      state.errorMessage = { type: "", message: "", level: 0 };
    },
    updateAuthorMessages: (state: any, action: PayloadAction<Message>) => {
      const { sender, id } = action.payload;
      state.chat[sender].messages[id] = action.payload;
      state.chat[sender].lastMessage = action.payload;
    },
    updateSenderMessages: (state: any, action: PayloadAction<Message>) => {
      const { target, id } = action.payload;
      if (!state.chat[target]) {
        state.chat[target] = {
          messages: {},
          lastMessage: {},
        };
      }
      state.chat[target].messages[id] = action.payload;
      state.chat[target].lastMessage = action.payload;
    },
    setAuthorPubKey: (state, action: PayloadAction<PubKey>) => {
      const { contact, value } = action.payload;
      state.chat[contact].pubKey = value;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  setMessageError,
  addMessageList,
  updateAuthorMessages,
  updateSenderMessages,
  setAuthorPubKey,
  setBlockedList,
  setBlockedUser,
  setUnblockedUser,
} = messagesSlice.actions;

export const userMessages = (state: any) => state.messages.chat;
export const userMessagesError = (state: any) => state.messages.errorMessage;
export const userBlockedAddresses = (state: any) =>
  state.messages.blockedAddress;
export const messageStore = messagesSlice.reducer;
