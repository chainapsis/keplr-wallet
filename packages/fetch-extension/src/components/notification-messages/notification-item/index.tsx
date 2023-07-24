import { NotyphiNotification } from "@notificationTypes";
import { timeSince } from "@utils/time-since-date";
import React, { FunctionComponent, useState } from "react";
import style from "./style.module.scss";
import ReactHtmlParser from "react-html-parser";
import jazzicon from "@metamask/jazzicon";
import { useStore } from "../../../stores";
import { FormattedMessage } from "react-intl";
import { markDeliveryAsClicked } from "@utils/fetch-notification";
import { useNavigate } from "react-router";
interface Props {
  elem: NotyphiNotification;
  onCrossClick: (deliveryId: string) => void;
  onFlagClick: (deliveryId: string) => void;
}
export const NotificationItem: FunctionComponent<Props> = ({
  elem,
  onCrossClick,
  onFlagClick,
}) => {
  const [flag, setFlag] = useState(false);
  const { chainStore, accountStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const { delivery_id, delivered_at, cta_url } = elem;
  const elemDate = new Date(delivered_at);
  const time = timeSince(elemDate);
  const navigate = useNavigate();
  const handleFlag = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    analyticsStore.logEvent("Notification flag click");
    if (!flag) {
      setFlag(true);
      const item = document.getElementById(delivery_id);

      setTimeout(() => {
        setFlag(false);
        item?.classList.add(style["remove"]);
        onFlagClick(delivery_id);
      }, 1500);
    }
  };

  const handleNavigateToUrl = () => {
    if (cta_url != null) {
      analyticsStore.logEvent("Notification click");

      const localNotifications = JSON.parse(
        localStorage.getItem(`notifications-${accountInfo.bech32Address}`) ||
          JSON.stringify([])
      );

      const unclickedNotifications: NotyphiNotification[] =
        localNotifications.filter(
          (notification: NotyphiNotification) =>
            notification.delivery_id !== delivery_id
        );

      markDeliveryAsClicked(elem.delivery_id, accountInfo.bech32Address).then(
        () => {
          localStorage.setItem(
            `notifications-${accountInfo.bech32Address}`,
            JSON.stringify(unclickedNotifications)
          );

          /// Handling a url and internal page navigation
          if (cta_url.startsWith("http")) {
            window.open(cta_url);
          } else if (cta_url.startsWith("www")) {
            window.open(`https:${cta_url}`);
          } else if (cta_url.startsWith("/")) {
            navigate(cta_url);
          }
        }
      );
    }
  };

  const handleRead = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    analyticsStore.logEvent("Notification remove click");
    const item = document.getElementById(delivery_id);
    item?.classList.add(style["remove"]);

    setTimeout(() => {
      onCrossClick(delivery_id);
    }, 500);
  };

  return (
    <React.Fragment>
      <div
        className={style["notification"]}
        onClick={handleNavigateToUrl}
        id={delivery_id}
      >
        <div className={style["notificationHead"]}>
          <div className={style["notificationImage"]}>
            {elem.image_url ? (
              <img draggable={false} src={elem.image_url} />
            ) : (
              ReactHtmlParser(jazzicon(32, elem.delivery_id).outerHTML)
            )}
          </div>

          <p className={style["headName"]}>{elem.organisation_name}</p>
          <div className={style["notificationIcons"]}>
            <img
              draggable={false}
              src={require("@assets/svg/flag-icon.svg")}
              id={delivery_id}
              className={flag ? style["disabled"] : style["flag"]}
              onClick={handleFlag}
            />
            <img
              draggable={false}
              src={require("@assets/svg/cross-icon.svg")}
              className={style["cross"]}
              onClick={handleRead}
            />
          </div>
        </div>

        <p className={style["notificationTitle"]}>{elem.title}</p>

        <div className={style["notificationMsg"]}>
          <p>{elem.content}</p>
        </div>

        <div className={style["notificationTime"]}>
          <p>{time}</p>
        </div>
      </div>
      {flag && (
        <div className={style["flagged"]}>
          <p className={style["flaggedText"]}>
            <FormattedMessage id="notification.item.flag-message" />
          </p>
        </div>
      )}
    </React.Fragment>
  );
};
