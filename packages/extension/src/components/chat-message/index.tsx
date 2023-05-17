import classnames from "classnames";
import React, { ReactElement, useEffect, useState } from "react";
import { Container } from "reactstrap";
import deliveredIcon from "@assets/icon/chat-unseen-status.png";
import chatSeenIcon from "@assets/icon/chat-seen-status.png";
import { decryptMessage } from "@utils/decrypt-message";
import style from "./style.module.scss";
import { isToday, isYesterday, format } from "date-fns";
import { store } from "@chatStore/index";
import { setMessageError } from "@chatStore/messages-slice";
import { MessagePrimitive } from "@utils/encrypt-message";

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, "p");
};

export const ChatMessage = ({
  chainId,
  message,
  isSender,
  timestamp,
  showDate,
  groupLastSeenTimestamp,
}: {
  chainId: string;
  isSender: boolean;
  message: string;
  timestamp: number;
  showDate: boolean;
  groupLastSeenTimestamp: number;
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState<MessagePrimitive>();
  useEffect(() => {
    decryptMessage(chainId, message, isSender)
      .then((message) => {
        setDecryptedMessage(message);
      })
      .catch((e) => {
        store.dispatch(
          setMessageError({
            type: "authorization",
            message: "Something went wrong, Please try again in sometime.",
            level: 3,
          })
        );
        console.log("Error", e.message);
      });
  }, [chainId, isSender, message]);

  const getDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    if (isToday(d)) {
      return "Today";
    }
    if (isYesterday(d)) {
      return "Yesterday";
    }
    return format(d, "dd MMMM yyyy");
  };

  function decideMessageView(): ReactElement {
    let messageView = <i className="fas fa-spinner fa-spin ml-1" />;

    if (!decryptedMessage) return messageView;

    if (decryptedMessage.type === 1)
      messageView = (
        <div className={style.message}>{decryptedMessage.content.text}</div>
      );
    else {
      const messageObj = JSON.parse(decryptedMessage.content.text);
      messageView = (
        <div className={style.message}>
          {messageObj?.message || "Cant Parse Message"}
        </div>
      );
    }
    return messageView;
  }

  return (
    <React.Fragment>
      <div className={style.currentDateContainer}>
        {" "}
        {showDate ? (
          <span className={style.currentDate}>{getDate(timestamp)}</span>
        ) : null}
      </div>
      <div className={isSender ? style.senderAlign : style.receiverAlign}>
        <Container
          fluid
          className={classnames(style.messageBox, {
            [style.senderBox]: isSender,
          })}
        >
          {decideMessageView()}
          <div className={style.timestamp}>
            {formatTime(timestamp)}
            {isSender && groupLastSeenTimestamp < timestamp && (
              <img draggable={false} alt="delivered" src={deliveredIcon} />
            )}
            {isSender && groupLastSeenTimestamp >= timestamp && (
              <img draggable={false} alt="seen" src={chatSeenIcon} />
            )}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};
