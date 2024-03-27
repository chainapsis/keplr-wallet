import { HeaderLayout } from "@layouts/header-layout";
import {
  NotificationSetup,
  NotyphiOrganisation,
  NotyphiTopic,
} from "@notificationTypes";

import { useStore } from "../../../stores";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "reactstrap";
import style from "./style.module.scss";
import { FormattedMessage } from "react-intl";
import { ToolTip } from "@components/tooltip";
export const ReviewNotification: FunctionComponent = () => {
  const navigate = useNavigate();
  const { chainStore, accountStore, chatStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const notificationInfo: NotificationSetup =
    chatStore.userDetailsStore.notifications;
  const [organisations, setOrganisations] = useState("");
  const topics: NotyphiTopic[] = JSON.parse(
    localStorage.getItem(`topics-${accountInfo.bech32Address}`) ||
      JSON.stringify([])
  );
  const topicStr = useRef<string>(
    topics.map((item: NotyphiTopic) => item.name).join(", ")
  );

  useEffect(() => {
    const data = Object.values(notificationInfo.organisations)
      .map((item: NotyphiOrganisation) => item.name)
      .join(", ");

    setOrganisations(data);
  }, [notificationInfo.organisations]);

  const onBackClick = () => {
    analyticsStore.logEvent("back_click", {
      pageName: "Notifications Setting",
    });
    navigate(-3);
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"Notifications"}
      showBottomMenu={false}
      onBackButton={onBackClick}
    >
      <div className={style["reviewContainer"]}>
        <p className={style["reviewHeading"]}>
          <FormattedMessage id="notification.review.header-message" />
        </p>
        <div className={style["greyCircle"]}>
          <img src={require("@assets/svg/initial-bell-icon.svg")} />
        </div>

        <p className={style["reviewChoice"]}>Organisations</p>
        {organisations.length > 40 ? (
          <ToolTip
            tooltip={organisations}
            theme="dark"
            trigger="hover"
            options={{
              placement: "top-end",
            }}
          >
            <p className={style["reviewOptions"]}>
              <span>{organisations}</span>
            </p>
          </ToolTip>
        ) : (
          <p className={style["reviewOptions"]}>
            <span>{organisations}</span>
          </p>
        )}

        {Object.values(topics).length > 0 && (
          <p className={style["reviewChoice"]}>Topics</p>
        )}

        {topicStr.current.length > 40 ? (
          <ToolTip
            tooltip={topicStr.current}
            theme="dark"
            trigger="hover"
            options={{
              placement: "top-end",
            }}
          >
            <p className={style["reviewOptions"]}>{topicStr.current}</p>
          </ToolTip>
        ) : (
          <p className={style["reviewOptions"]}>{topicStr.current}</p>
        )}
        <p className={style["reviewNote"]}>
          These can be changed at any time from the settings menu.
        </p>

        <div className={style["reviewButtonContainer"]}>
          <Button
            className={style["button"] + " " + style["invertedButton"]}
            onClick={() => navigate("/setting/notifications")}
          >
            Settings
          </Button>
          <Button
            className={style["button"]}
            color="primary"
            onClick={onBackClick}
          >
            Back Home
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
};
