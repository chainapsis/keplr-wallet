import { NotyphiNotification, NotyphiNotifications } from "@notificationTypes";
import {
  fetchAllNotifications,
  markDeliveryAsRead,
} from "@utils/fetch-notification";

export const fetchAndPopulateNotifications = async (walletAddress: string) => {
  const notificationData = await fetchAllNotifications(walletAddress);

  const notifications: NotyphiNotifications = {};

  const localNotifications: NotyphiNotification[] = JSON.parse(
    localStorage.getItem(`notifications-${walletAddress}`) ?? JSON.stringify([])
  );

  notificationData?.map((element: NotyphiNotification) => {
    notifications[element.delivery_id] = element;
  });
  localNotifications.map((element) => {
    notifications[element.delivery_id] = element;
  });

  localStorage.setItem(
    `notifications-${walletAddress}`,
    JSON.stringify(Object.values(notifications))
  );

  ///Read all notification when delivered
  notificationData?.map((element: NotyphiNotification) => {
    markDeliveryAsRead(element.delivery_id, walletAddress);
  });
  return notifications;
};
