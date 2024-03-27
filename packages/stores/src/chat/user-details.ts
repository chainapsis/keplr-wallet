import { makeAutoObservable, runInAction } from "mobx";
import { NotificationSetup } from "./user-details-types";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "./constants";

export interface WalletConfig {
  notiphyWhitelist: string[] | undefined;
  fetchbotActive: boolean;
  requiredNative: boolean;
}

export class UserDetailsStore {
  notifications: NotificationSetup = {
    unreadNotification: false,
    isNotificationOn: true,
    organisations: {},
    allNotifications: [],
  };

  accessToken = "";
  walletConfig: WalletConfig = {
    notiphyWhitelist: process.env["NODE_ENV"] === "production" ? undefined : [],
    fetchbotActive: process.env["NODE_ENV"] !== "production",
    requiredNative: process.env["NODE_ENV"] === "production",
  };
  messagingPubKey = {
    publicKey: null,
    privacySetting: null,
    chatReadReceiptSetting: true,
  };
  showAgentDisclaimer = true;
  hasFET = false;
  enabledChainIds = [CHAIN_ID_FETCHHUB, CHAIN_ID_DORADO];

  constructor() {
    makeAutoObservable(this);
  }

  resetUser() {
    this.notifications = {
      unreadNotification: false,
      isNotificationOn: true,
      organisations: {},
      allNotifications: [],
    };
    this.accessToken = "";
    this.walletConfig = {
      notiphyWhitelist:
        process.env["NODE_ENV"] === "production" ? undefined : [],
      fetchbotActive: process.env["NODE_ENV"] !== "production",
      requiredNative: process.env["NODE_ENV"] === "production",
    };
    this.messagingPubKey = {
      publicKey: null,
      privacySetting: null,
      chatReadReceiptSetting: true,
    };
    this.showAgentDisclaimer = true;
    this.hasFET = false;
    this.enabledChainIds = [CHAIN_ID_FETCHHUB, CHAIN_ID_DORADO];
  }

  setNotifications(notifications: Partial<NotificationSetup>) {
    this.notifications = { ...this.notifications, ...notifications };
  }

  setMessagingPubKey(messagingPubKey: any) {
    this.messagingPubKey = messagingPubKey;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  setHasFET(hasFET: boolean) {
    runInAction(() => {
      this.hasFET = hasFET;
    });
  }

  setShowAgentDisclaimer(showAgentDisclaimer: boolean) {
    this.showAgentDisclaimer = showAgentDisclaimer;
  }

  setWalletConfig(walletConfig: WalletConfig) {
    if (process.env["NODE_ENV"] === "production") {
      this.walletConfig = walletConfig;
    }
  }
}

export const userDetailsStore = new UserDetailsStore();
