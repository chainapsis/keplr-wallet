import bellIcon from "@assets/icon/bell.svg";
import chatIcon from "@assets/icon/chat.svg";
import homeIcon from "@assets/icon/home.svg";
import activityIcon from "@assets/icon/lightning-bolt.svg";
import moreIcon from "@assets/icon/more.svg";
import { store } from "@chatStore/index";
import {
  WalletConfig,
  notificationsDetails,
  setNotifications,
  userDetails,
  walletConfig,
} from "@chatStore/user-slice";
import { NotificationSetup } from "@notificationTypes";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CHAIN_ID_FETCHHUB } from "../../config.ui.var";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { Tab } from "./tab";

const bottomNav = [
  {
    title: "Home",
    icon: homeIcon,
    path: "/",
    disabled: false,
    tooltip: "Home",
  },
  {
    title: "More",
    icon: moreIcon,
    path: "/more",
    disabled: false,
  },
];

export const BottomNav = () => {
  return (
    <div className={style["bottomNavContainer"]}>
      <HomeTab />
      <NotificationTab />
      <ChatTab />
      <ActivityTab />
      <MoreTab />
    </div>
  );
};

const HomeTab = () => <Tab {...bottomNav[0]} />;
const NotificationTab = () => {
  const { keyRingStore, accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const config: WalletConfig = useSelector(walletConfig);
  const notificationInfo: NotificationSetup = useSelector(notificationsDetails);
  const [isComingSoon, setIsComingSoon] = useState<boolean>(true);

  useEffect(() => {
    if (keyRingStore.keyRingType === "ledger") {
      setIsComingSoon(true);
    } else {
      setIsComingSoon(
        config.notiphyWhitelist === undefined
          ? true
          : config.notiphyWhitelist.length !== 0 &&
              config.notiphyWhitelist.indexOf(accountInfo.bech32Address) === -1
      );
    }

    const notificationFlag =
      localStorage.getItem(`turnNotifications-${accountInfo.bech32Address}`) ||
      "true";
    const localNotifications = JSON.parse(
      localStorage.getItem(`notifications-${accountInfo.bech32Address}`) ||
        JSON.stringify([])
    );

    store.dispatch(
      setNotifications({
        allNotifications: localNotifications,
        unreadNotification: localNotifications.length > 0,
        isNotificationOn: notificationFlag == "true",
      })
    );
  }, [accountInfo.bech32Address, config.notiphyWhitelist]);

  return (
    <React.Fragment>
      {!isComingSoon &&
        notificationInfo.unreadNotification &&
        notificationInfo.isNotificationOn && (
          <span className={style["bellDot"]} />
        )}
      <Tab
        title={"Notifications"}
        icon={bellIcon}
        path={"/notification"}
        disabled={isComingSoon}
        tooltip={"Coming Soon"}
      />
    </React.Fragment>
  );
};
const ChatTab = () => {
  const { keyRingStore, chainStore } = useStore();
  const { hasFET, enabledChainIds } = useSelector(userDetails);
  const config: WalletConfig = useSelector(walletConfig);
  const current = chainStore.current;
  const [chatTooltip, setChatTooltip] = useState("");
  const [chatDisabled, setChatDisabled] = useState(false);

  useEffect(() => {
    if (keyRingStore.keyRingType === "ledger") {
      setChatTooltip("Coming soon for ledger");
      setChatDisabled(true);
      return;
    }

    if (config.requiredNative && !hasFET) {
      setChatTooltip("You need to have FET balance to use this feature");
      setChatDisabled(true);
      return;
    } else {
      setChatTooltip("");
      setChatDisabled(false);
    }

    if (!enabledChainIds.includes(current.chainId)) {
      setChatTooltip("Feature not available on this network");
      setChatDisabled(true);
      return;
    }
  }, [
    hasFET,
    enabledChainIds,
    config.requiredNative,
    keyRingStore.keyRingType,
    current.chainId,
  ]);

  return (
    <Tab
      title={"Chat"}
      icon={chatIcon}
      path={"/chat"}
      disabled={chatDisabled}
      tooltip={chatTooltip}
    />
  );
};

const ActivityTab = () => {
  const { keyRingStore, chainStore } = useStore();
  const current = chainStore.current;
  const [activityTooltip, setActivityTooltip] = useState("");
  const [activityDisabled, setActivityDisabled] = useState(false);

  useEffect(() => {
    if (keyRingStore.keyRingType === "ledger") {
      setActivityTooltip("Coming soon for ledger");
      setActivityDisabled(true);
      return;
    }
    if (![CHAIN_ID_FETCHHUB].includes(current.chainId)) {
      setActivityTooltip("Feature not available on this network");
      setActivityDisabled(true);
    } else {
      setActivityTooltip("");
      setActivityDisabled(false);
    }
  }, [current.chainId, keyRingStore.keyRingType]);

  return (
    <Tab
      title={"Activity"}
      icon={activityIcon}
      path={"/activity"}
      disabled={activityDisabled}
      tooltip={activityTooltip}
    />
  );
};
const MoreTab = () => <Tab {...bottomNav[1]} />;
