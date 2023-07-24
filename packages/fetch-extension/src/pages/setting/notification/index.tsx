import { HeaderLayout } from "@layouts/header-layout";
import React, { FunctionComponent, useMemo } from "react";
import { useNavigate } from "react-router";
import style from "./style.module.scss";
import { NotificationOption } from "@components/notification-option/notification-option";
import { PageButton } from "../page-button";
import { notificationsDetails, setNotifications } from "@chatStore/user-slice";
import { NotificationSetup } from "@notificationTypes";
import { useSelector } from "react-redux";
import { useStore } from "../../../stores";
import { store } from "@chatStore/index";

export const SettingNotifications: FunctionComponent = () => {
  const navigate = useNavigate();
  const { chainStore, accountStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const notificationInfo: NotificationSetup = useSelector(notificationsDetails);

  const topicInfo = JSON.parse(
    localStorage.getItem(`topics-${accountInfo.bech32Address}`) ||
      JSON.stringify([])
  );

  const topicSuffix = topicInfo.length > 1 ? "s" : "";
  const orgInfo = Object.values(notificationInfo.organisations);
  const orgSuffix = orgInfo.length > 1 ? "s" : "";

  const handleOnChange = () => {
    analyticsStore.logEvent(
      notificationInfo.isNotificationOn ? "Notification off" : "Notification on"
    );

    localStorage.setItem(
      `turnNotifications-${accountInfo.bech32Address}`,
      notificationInfo.isNotificationOn ? "false" : "true"
    );

    /// Updating the notification status in redux
    store.dispatch(
      setNotifications({
        isNotificationOn: !notificationInfo.isNotificationOn,
      })
    );
  };

  const icon = useMemo(
    () => [<i key="next" className="fas fa-chevron-right" />],
    []
  );
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Notifications"}
      showBottomMenu={false}
      onBackButton={() => {
        navigate(-1);
      }}
    >
      <div className={style["notificationSettingContainer"]}>
        <div className={style["notificationOptionMainContainer"]}>
          <NotificationOption
            name="Receive Notifications"
            isChecked={notificationInfo.isNotificationOn}
            handleOnChange={handleOnChange}
          />
          {!notificationInfo.isNotificationOn && (
            <p className={style["notificationOffMsg"]}>
              You are not receiving notifications
            </p>
          )}
        </div>

        {Object.values(notificationInfo.organisations).length !== 0 &&
        notificationInfo.isNotificationOn ? (
          <React.Fragment>
            <PageButton
              title="Organisations"
              paragraph={`${orgInfo.length} organisation${orgSuffix} followed`}
              icons={icon}
              onClick={() => {
                navigate("/notification/organisations/edit");
              }}
            />

            <PageButton
              title="Topics"
              paragraph={`${topicInfo.length} topic${topicSuffix} followed`}
              icons={icon}
              onClick={() => {
                navigate("/notification/topics/edit", {
                  state: {
                    isUpdating: true,
                  },
                });
              }}
            />
          </React.Fragment>
        ) : (
          <React.Fragment />
        )}
      </div>
    </HeaderLayout>
  );
};
