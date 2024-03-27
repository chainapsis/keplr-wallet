import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import { NotificationModal } from "@components/notification-modal";
import style from "./style.module.scss";
import { PoweredByNote } from "@components/notification-modal/powered-by-note/powered-by-note";
import { useStore } from "../../stores";
import { Menu } from "../main/menu";
import { NotificationSetup } from "@notificationTypes";
export const NotificationPage: FunctionComponent = () => {
  const { chainStore, accountStore, analyticsStore, chatStore } = useStore();

  const notificationInfo: NotificationSetup =
    chatStore.userDetailsStore.notifications;
  const navigate = useNavigate();

  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const navigateToSettingsHandler = () => {
    navigate("/setting/notifications");
    analyticsStore.logEvent("settings_click", { pageName: "Notification Tab" });
  };

  const handleClearAll = () => {
    analyticsStore.logEvent("notification_clear_all_click");
    localStorage.removeItem(`notifications-${accountInfo.bech32Address}`);
    chatStore.userDetailsStore.setNotifications({
      allNotifications: [],
    });
  };

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <div className={style["activityContainer"]}>
        {(Object.values(notificationInfo.allNotifications).length > 0 ||
          Object.values(notificationInfo.organisations).length !== 0) &&
          notificationInfo.isNotificationOn && (
            <div className={style["heading"]}>
              {Object.values(notificationInfo.allNotifications).length > 0 && (
                <div className={style["deleteIcon"]} onClick={handleClearAll}>
                  <img
                    src={require("@assets/svg/delete-icon.svg")}
                    draggable={false}
                  />
                  <p className={style["clearAll"]}>Clear all</p>
                </div>
              )}
              {Object.values(notificationInfo.organisations).length !== 0 && (
                <p
                  className={style["settings"]}
                  onClick={navigateToSettingsHandler}
                >
                  Settings
                </p>
              )}
            </div>
          )}

        <NotificationModal />
        <PoweredByNote />
      </div>
    </HeaderLayout>
  );
};
