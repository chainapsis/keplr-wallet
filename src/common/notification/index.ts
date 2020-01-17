export type NotificationOptions = browser.notifications.CreateNotificationOptions & {
  // iconUrl is required for chrome
  iconUrl: string;
};

export class Notification {
  static create(options: NotificationOptions) {
    if (typeof browser !== "undefined") {
      browser.notifications.create(options);
    } else {
      chrome.notifications.create(options);
    }
  }
}
