import { HeaderLayout } from "@layouts/header-layout";
import React, { FunctionComponent, useMemo } from "react";
import { useHistory } from "react-router";
import style from "./style.module.scss";
import { NotificationOption } from "../../../components/notification-option/notification-option";
import { PageButton } from "../page-button";
import { notificationsDetails, setNotifications } from "@chatStore/user-slice";
import { NotificationSetup } from "@notificationTypes";
import { useSelector } from "react-redux";
import { useStore } from "../../../stores";
import { store } from "@chatStore/index";
import amplitude from "amplitude-js";

export const SettingNotifications: FunctionComponent = () => {
  const history = useHistory();
  const { chainStore, accountStore } = useStore();
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
    amplitude
      .getInstance()
      .logEvent(
        notificationInfo.isNotificationOn
          ? "Notification off"
          : "Notification on",
        {}
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
        history.goBack();
      }}
    >
      <div className={style.notificationSettingContainer}>
        <div className={style.notificationOptionMainContainer}>
          <NotificationOption
            name="Receive notifications"
            isChecked={notificationInfo.isNotificationOn}
            handleOnChange={handleOnChange}
          />
          {!notificationInfo.isNotificationOn && (
            <p className={style.notificationOffMsg}>
              You are not receiving notifications
            </p>
          )}
        </div>

        {Object.values(notificationInfo.organisations).length !== 0 &&
        notificationInfo.isNotificationOn ? (
          <>
            <PageButton
              title="Organisations"
              paragraph={`${orgInfo.length} organisation${orgSuffix} followed`}
              icons={icon}
              onClick={() => {
                history.push("/notification/organisations/edit");
              }}
            />

            <PageButton
              title="Topics"
              paragraph={`${topicInfo.length} topic${topicSuffix} followed`}
              icons={icon}
              onClick={() => {
                history.push({
                  pathname: "/notification/topics/edit",
                  state: {
                    isUpdating: true,
                  },
                });
              }}
            />
          </>
        ) : (
          <></>
        )}
      </div>
    </HeaderLayout>
  );
};
