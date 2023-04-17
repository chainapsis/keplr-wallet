import { NotyphiNotifications, NotyphiNotification } from "@notificationTypes";
import {
  fetchAllNotifications,
  markDeliveryAsRead,
} from "@utils/fetch-notification";
import { store } from "../stores/chats";
import { setNotifications } from "../stores/chats/user-slice";

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

  store.dispatch(
    setNotifications({
      unreadNotification: Object.values(notifications).length > 0,
      allNotifications: Object.values(notifications),
    })
  );

  ///Read all notification when delivered
  notificationData?.map((element: NotyphiNotification) => {
    markDeliveryAsRead(element.delivery_id, walletAddress);
  });
};
