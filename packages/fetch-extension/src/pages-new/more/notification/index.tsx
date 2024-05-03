import { Card } from "@components-v2/card";
import { NotificationOption } from "@components-v2/notification-option";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { NotificationSetup } from "@notificationTypes";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
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

  const topicSuffix = topicInfo.length > 1 ? "s" : "";
  const orgInfo = Object.values(notificationInfo.organisations);
  const orgSuffix = orgInfo.length > 1 ? "s" : "";

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

  const icon = useMemo(
    () => [<i key="next" className="fas fa-chevron-right" />],
    []
  );
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
            subheading={`${orgInfo.length} organisation${orgSuffix} followed`}
            rightContent={icon}
            onClick={() => {
              analyticsStore.logEvent("organisations_click", {
                action: "Edit",
              });
              navigate("/notification/organisations/edit");
            }}
          />

          <Card
            heading="Topics"
            subheading={`${topicInfo.length} topic${topicSuffix} followed`}
            rightContent={icon}
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
          />
        </React.Fragment>
      ) : (
        <React.Fragment />
      )}
    </HeaderLayout>
  );
});
