import { NotificationSetup } from "@notificationTypes";
import { createSlice } from "@reduxjs/toolkit";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../config.ui.var";

export interface WalletConfig {
  notiphyWhitelist: string[] | undefined;
  fetchbotActive: boolean;
  requiredNative: boolean;
}

const initialState = {
  notifications: {
    unreadNotification: false,
    isNotificationOn: true,
    organisations: {},
    allNotifications: [],
  } as NotificationSetup,
  accessToken: "",
  walletConfig: {
    notiphyWhitelist: undefined,
    fetchbotActive: process.env.NODE_ENV !== "production",
    requiredNative: process.env.NODE_ENV == "production",
  } as WalletConfig,
  messagingPubKey: {
    publicKey: null,
    privacySetting: null,
    chatReadReceiptSetting: true,
  },
  showAgentDisclaimer: true,
  hasFET: false,
  enabledChainIds: [CHAIN_ID_FETCHHUB, CHAIN_ID_DORADO],
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    resetUser: (_state, _action) => initialState,
    setNotifications: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setMessagingPubKey: (state, action) => {
      state.messagingPubKey = action.payload;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setHasFET: (state, action) => {
      state.hasFET = action.payload;
    },
    setShowAgentDisclaimer: (state, action) => {
      state.showAgentDisclaimer = action.payload;
    },
    setWalletConfig: (state, action) => {
      if (process.env.NODE_ENV == "production")
        state.walletConfig = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetUser,
  setMessagingPubKey,
  setAccessToken,
  setNotifications,
  setShowAgentDisclaimer,
  setWalletConfig,
  setHasFET,
} = userSlice.actions;

export const userDetails = (state: { user: any }) => state.user;
export const walletConfig = (state: { user: any }) => state.user.walletConfig;
export const notificationsDetails = (state: { user: any }) =>
  state.user.notifications;
export const userChatActive = (state: { user: any }) =>
  state.user.walletConfig.requiredNative;

export const userStore = userSlice.reducer;
