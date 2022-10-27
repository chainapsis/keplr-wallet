import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    notifications: [],
    accessToken: "",
    messagingPubKey: {
      publicKey: null,
      privacySetting: null,
    },
  },
  reducers: {
    resetUser: (state, _action) => {
      state.notifications = [];
      state.messagingPubKey = {
        publicKey: null,
        privacySetting: null,
      };
      state.accessToken = "";
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setMessagingPubKey: (state, action) => {
      state.messagingPubKey = action.payload;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetUser,
  setMessagingPubKey,
  setAccessToken,
  setNotifications,
} = userSlice.actions;

export const userDetails = (state: { user: any }) => state.user;

export const userStore = userSlice.reducer;
