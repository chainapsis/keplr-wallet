import { Card } from "@components-v2/card";
import { NotificationOption } from "@components-v2/notification-option";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { NotificationSetup } from "@notificationTypes";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import style from "./style.module.scss";

export const MoreNotifications = observer(() => {
  const navigate = useNavigate();
  const { chainStore, accountStore, analyticsStore, chatStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const notificationInfo: NotificationSetup =
    chatStore.userDetailsStore.notifications;

  const topicInfo = JSON.parse(
    localStorage.getItem(`topics-${accountInfo.bech32Address}`) ||
      JSON.stringify([])
  );

  const orgInfo = Object.values(notificationInfo.organisations);

  const handleOnChange = () => {
    analyticsStore.logEvent(
      notificationInfo.isNotificationOn
        ? "notification_off_click"
        : "notification_on_click"
    );

    localStorage.setItem(
      `turnNotifications-${accountInfo.bech32Address}`,
      notificationInfo.isNotificationOn ? "false" : "true"
    );

    /// Updating the notification status
    chatStore.userDetailsStore.setNotifications({
      isNotificationOn: !notificationInfo.isNotificationOn,
    });
  };

  return (
    <HeaderLayout
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Notifications"}
      showBottomMenu={false}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Notifications",
        });
        navigate(-1);
      }}
    >
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
          <Card
            heading="Organisations"
            rightContent={
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {orgInfo.length}
              </div>
            }
            onClick={() => {
              analyticsStore.logEvent("organisations_click", {
                action: "Edit",
              });
              navigate("/notification/organisations/edit");
            }}
            inActiveBackground={"rgba(255,255,255,0.1)"}
            style={{
              height: "60px",
            }}
          />

          <Card
            heading="Topics"
            rightContent={
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {topicInfo.length}
              </div>
            }
            onClick={() => {
              analyticsStore.logEvent("topics_click", {
                action: "Edit",
              });
              navigate("/notification/topics/edit", {
                state: {
                  isUpdating: true,
                },
              });
            }}
            inActiveBackground={"rgba(255,255,255,0.1)"}
            style={{
              height: "60px",
            }}
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
    </HeaderLayout>
  );
});
