import React, { FunctionComponent } from "react";
import { useHistory } from "react-router";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import { NotificationModal } from "@components/notification-modal";
import style from "./style.module.scss";
import { PoweredByNote } from "@components/notification-modal/powered-by-note/powered-by-note";
import { useSelector } from "react-redux";
import { notificationsDetails, setNotifications } from "@chatStore/user-slice";
import { useStore } from "../../stores";
import { store } from "@chatStore/index";
import { Menu } from "../main/menu";
import { NotificationSetup } from "@notificationTypes";
import amplitude from "amplitude-js";
export const NotificationPage: FunctionComponent = () => {
  const notificationInfo: NotificationSetup = useSelector(notificationsDetails);
  const history = useHistory();
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const navigateToSettingsHandler = () => {
    history.push("/setting/notifications");
  };

  const handleClearAll = () => {
    amplitude.getInstance().logEvent("Notification clear all click", {});
    localStorage.removeItem(`notifications-${accountInfo.bech32Address}`);
    store.dispatch(setNotifications({ allNotifications: [] }));
  };

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <div className={style.activityContainer}>
        {(Object.values(notificationInfo.allNotifications).length > 0 ||
          Object.values(notificationInfo.organisations).length !== 0) &&
          notificationInfo.isNotificationOn && (
            <div className={style.heading}>
              {Object.values(notificationInfo.allNotifications).length > 0 && (
                <div className={style.deleteIcon} onClick={handleClearAll}>
                  <img
                    src={require("@assets/svg/delete-icon.svg")}
                    draggable={false}
                  />
                  <p className={style.clearAll}>Clear all</p>
                </div>
              )}
              {Object.values(notificationInfo.organisations).length !== 0 && (
                <p
                  className={style.settings}
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
