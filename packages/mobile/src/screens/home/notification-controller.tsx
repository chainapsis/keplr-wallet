import { useSmartNavigation } from "../../navigation";
import PushNotification from "react-native-push-notification";
import messaging from "@react-native-firebase/messaging";
import React, { FunctionComponent, useEffect } from "react";
import { Platform } from "react-native";
import PushNotificationIOS from "@react-native-community/push-notification-ios";

export const NotificationController: FunctionComponent = ({ children }) => {
  const smartNavigation = useSmartNavigation();

  const notificationDataHandler = (data: Record<string, any>) => {
    if (data?.type === "Governance Details") {
      smartNavigation.navigateSmart("Governance Details", {
        proposalId: data?.proposalId,
        chainId: data?.chainId,
      });
    } else {
      console.log(data);
    }
  };

  if (Platform.OS === "android") {
    PushNotification.createChannel(
      {
        channelId: "keplr-notification-channel",
        channelName: "Keplr",
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }

  PushNotification.configure({
    onRegister: (token) => {
      console.log(token);
      messaging().requestPermission();
    },
    onNotification: (notification) => {
      if (notification.userInteraction) {
        notificationDataHandler(notification.data);
      }

      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
  });

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      PushNotification.localNotification({
        channelId: "keplr-notification-channel",
        message: remoteMessage.notification?.body ?? "",
        title: remoteMessage.notification?.title ?? "",
        userInfo: remoteMessage.data,
      });
    });

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      if (remoteMessage.data) {
        notificationDataHandler(remoteMessage.data);
      }
    });

    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage?.data) {
          notificationDataHandler(remoteMessage.data);
        }
      });

    return unsubscribe;
  }, []);

  return <React.Fragment>{children}</React.Fragment>;
};
