import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  accessToken: "",
  messagingPubKey: {
    publicKey: null,
    privacySetting: null,
  },
  isChatActive: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    resetUser: (_state, _action) => initialState,
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setMessagingPubKey: (state, action) => {
      state.messagingPubKey = action.payload;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setIsChatActive: (state, action) => {
      state.isChatActive = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetUser,
  setMessagingPubKey,
  setAccessToken,
  setNotifications,
  setIsChatActive,
} = userSlice.actions;

export const userDetails = (state: { user: any }) => state.user;
export const userChatActive = (state: { user: any }) => state.user.isChatActive;

export const userStore = userSlice.reducer;
