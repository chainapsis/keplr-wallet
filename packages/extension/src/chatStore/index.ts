import { configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
// import { composeWithDevTools } from 'redux-devtools-extension';
import localStorage from "redux-persist/lib/storage";
import { messageStore } from "./messages-slice";
import { userStore } from "./user-slice";

const messagesConfig = {
  key: "messages",
  storage: localStorage,
};

const userConfig = {
  key: "user",
  storage: localStorage,
};

const customizedMiddleware = (getDefaultMiddleware: any) =>
  getDefaultMiddleware({
    serializableCheck: false,
  });
const persistedMessages = persistReducer(messagesConfig, messageStore);
const persistedUserDetails = persistReducer(userConfig, userStore);

export const store = configureStore({
  reducer: {
    messages: persistedMessages,
    user: persistedUserDetails,
  },
  middleware: customizedMiddleware,
});
