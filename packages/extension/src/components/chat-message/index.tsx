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
import { TokenDropdown } from "@components/agents/tokens-dropdown";
import { IBCChainSelector } from "@components/agents/ibc-chain-selector";
import { SignTransaction } from "@components/agents/sign-transaction";
import { MessageFeedBack } from "@components/chat-message-feedback";
import { useHistory } from "react-router";

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, "p");
};

export const ChatMessage = ({
  chainId,
  messageId,
  message,
  isSender,
  timestamp,
  showDate,
  groupLastSeenTimestamp,
  disabled,
  setIsInputType2,
}: {
  chainId: string;
  messageId: string;
  isSender: boolean;
  message: string;
  timestamp: number;
  showDate: boolean;
  groupLastSeenTimestamp: number;
  disabled: boolean;
  setIsInputType2?: any;
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState<MessagePrimitive>();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const history = useHistory();
  const targetAddress = history.location.pathname.split("/")[3];
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

    if (decryptedMessage.type === 1) {
      messageView = (
        <div className={style.message}>{decryptedMessage.content.text}</div>
      );
      if (setIsInputType2 && !disabled) setIsInputType2(false);
    } else {
      const messageObj = JSON.parse(decryptedMessage.content.text);

      switch (messageObj.method) {
        case "signTransaction":
          messageView = (
            <SignTransaction
              rawText={messageObj.message}
              chainId={chainId}
              disabled={disabled}
            />
          );
          break;
        case "inputToken":
          messageView = (
            <TokenDropdown label={messageObj.message} disabled={disabled} />
          );
          break;
        case "inputIBCToken":
          messageView = (
            <TokenDropdown label={messageObj.message} ibc disabled={disabled} />
          );
          break;
        case "inputChannel":
          messageView = (
            <IBCChainSelector label={messageObj.message} disabled={disabled} />
          );
          break;
        default:
          messageView = (
            <div className={style.message}>
              {messageObj?.message || "Cant Parse Message"}
            </div>
          );
          break;
      }
      if (setIsInputType2 && !disabled) setIsInputType2(true);
    }
    return messageView;
  }

  return (
    <>
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {decideMessageView()}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className={style.timestamp}>
              {!isSender && isHovered && targetAddress?.includes("agent") && (
                <MessageFeedBack
                  messageId={messageId}
                  chainId={chainId}
                  targetAddress={targetAddress}
                />
              )}
            </div>
            <div className={style.timestamp}>
              {formatTime(timestamp)}
              {isSender && groupLastSeenTimestamp < timestamp && (
                <img draggable={false} alt="delivered" src={deliveredIcon} />
              )}
              {isSender && groupLastSeenTimestamp >= timestamp && (
                <img draggable={false} alt="seen" src={chatSeenIcon} />
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
