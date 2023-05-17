import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { NotificationItem } from "@components/notification-messages/notification-item/index";
import { markDeliveryAsRejected } from "@utils/fetch-notification";
import { useStore } from "../../stores";
import { NotificationSetup, NotyphiNotification } from "@notificationTypes";
import { store } from "@chatStore/index";
import { notificationsDetails, setNotifications } from "@chatStore/user-slice";
import { useSelector } from "react-redux";
import amplitude from "amplitude-js";
interface NotificationPayload {
  modalType: NotificationModalType;
  notificationList?: NotyphiNotification[];
  heading?: string;
  paragraph?: string;
  showSetting?: boolean;
  buttonLabel?: string;
  headingColor?: string;
  image?: string;
  subHeading?: string;
}

export enum NotificationModalType {
  initial,
  empty,
  notificationOff,
  notifications,
}

export const NotificationModal: FunctionComponent = () => {
  const history = useHistory();

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [isLoading, setIsLoading] = useState(true);
  const notificationInfo: NotificationSetup = useSelector(notificationsDetails);

  const [
    notificationPayload,
    setNotificationPayload,
  ] = useState<NotificationPayload>();

  const handleClick = () => {
    if (notificationPayload?.modalType === NotificationModalType.initial) {
      history.push("notification/organisations/add");
    } else if (
      notificationPayload?.modalType === NotificationModalType.notificationOff
    ) {
      amplitude.getInstance().logEvent("Notification on", {});

      localStorage.setItem(
        `turnNotifications-${accountInfo.bech32Address}`,
        "true"
      );
      setIsLoading(true);
      store.dispatch(setNotifications({ isNotificationOn: true }));
    }
  };

  const setNotificationPayloadHelper = (
    notifications: NotyphiNotification[]
  ) => {
    if (notifications.length === 0) {
      setNotificationPayload({
        modalType: NotificationModalType.empty,
        subHeading: "No new notifications",
        paragraph: "Add more topics or organisations in Settings.",
        showSetting: true,
        image: "no-notification-icon.svg",
      });
    } else {
      setNotificationPayload({
        modalType: NotificationModalType.notifications,
        notificationList: Object.values(notifications),
        heading: "",
      });
    }

    if (notificationInfo.unreadNotification && notifications.length === 0) {
      store.dispatch(
        setNotifications({
          unreadNotification: false,
        })
      );
    } else if (
      !notificationInfo.unreadNotification &&
      notifications.length > 0
    ) {
      store.dispatch(
        setNotifications({
          unreadNotification: true,
        })
      );
    }
  };

  useEffect(() => {
    if (!notificationInfo.isNotificationOn) {
      setIsLoading(false);
      setNotificationPayload({
        modalType: NotificationModalType.notificationOff,
        heading: "",
        subHeading: "Notifications turned off",
        buttonLabel: "Turn on Notifications",
        image: "turn-off-notification-icon.svg",
      });
      return;
    }

    setNotificationPayloadHelper(notificationInfo.allNotifications);
    setIsLoading(false);
  }, [
    accountInfo.bech32Address,
    notificationInfo.isNotificationOn,
    notificationInfo.allNotifications,
  ]);

  const onCrossClick = (deliveryId: string) => {
    if (notificationPayload?.notificationList) {
      const unreadNotifications = notificationPayload?.notificationList.filter(
        (notification: NotyphiNotification) =>
          notification.delivery_id !== deliveryId
      );

      store.dispatch(
        setNotifications({ allNotifications: unreadNotifications })
      );
      localStorage.setItem(
        `notifications-${accountInfo.bech32Address}`,
        JSON.stringify(unreadNotifications)
      );
    }
  };

  const onFlagClick = (deliveryId: string) => {
    markDeliveryAsRejected(deliveryId, accountInfo.bech32Address).finally(
      () => {
        /// Getting updated info everytime as flag UI take 2 sec delay to update
        const localNotifications = JSON.parse(
          localStorage.getItem(`notifications-${accountInfo.bech32Address}`) ||
            JSON.stringify([])
        );

        const newLocalNotifications = localNotifications.filter(
          (notification: NotyphiNotification) =>
            notification.delivery_id !== deliveryId
        );

        setTimeout(() => {
          store.dispatch(
            setNotifications({ allNotifications: newLocalNotifications })
          );
          localStorage.setItem(
            `notifications-${accountInfo.bech32Address}`,
            JSON.stringify(newLocalNotifications)
          );
        }, 300);
      }
    );
  };

  function decideNotificationView(): React.ReactNode {
    if (isLoading) {
      return (
        <div className={style.isLoading}>
          <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
        </div>
      );
    }

    if (notificationPayload && notificationPayload.notificationList) {
      return (
        <React.Fragment>
          {notificationPayload.notificationList.map((elem) => (
            <NotificationItem
              key={elem.delivery_id}
              elem={elem}
              onCrossClick={onCrossClick}
              onFlagClick={onFlagClick}
            />
          ))}
        </React.Fragment>
      );
    }

    if (notificationPayload) {
      return (
        <React.Fragment>
          <div className={style.notifyContainer}>
            <div className={style.greyCircle}>
              {notificationPayload.image && (
                <img
                  draggable={false}
                  src={require("@assets/svg/" + notificationPayload.image)}
                />
              )}
            </div>
            <p
              className={style.notifyHeading}
              style={{ color: notificationPayload.headingColor }}
            >
              {notificationPayload.heading}
            </p>
            {notificationPayload.subHeading && (
              <p className={style.notifySubHeading}>
                {notificationPayload.subHeading}
              </p>
            )}
            {notificationPayload.paragraph && (
              <p className={style.notifyDescription}>
                {notificationPayload.paragraph}
              </p>
            )}
            {notificationPayload.buttonLabel && (
              <Button
                className={style.notifyButton}
                color="primary"
                onClick={handleClick}
              >
                {notificationPayload.buttonLabel}
              </Button>
            )}
          </div>
        </React.Fragment>
      );
    }
  }

  return (
    <div
      className={
        notificationInfo.allNotifications.length > 0 &&
        notificationInfo.isNotificationOn
          ? `${style.notificationModal} ${style.preventCenter}`
          : `${style.notificationModal} ${style.enableCenter}`
      }
    >
      <div className={style.scrollView}>{decideNotificationView()}</div>
    </div>
  );
};
