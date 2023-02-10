import classnames from "classnames";
import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import deliveredIcon from "@assets/icon/chat-unseen-status.png";
import chatSeenIcon from "@assets/icon/chat-seen-status.png";
import style from "./style.module.scss";
import { isToday, isYesterday, format } from "date-fns";
import { decryptGroupMessage } from "@utils/decrypt-group";
import { GroupMessagePayload, NameAddress } from "@chatTypes";
import { GroupMessageType } from "@utils/encrypt-group";
import { getUserName, getEventMessage } from "@utils/index";
import { useStore } from "../../stores";

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return format(date, "p");
};

export const GroupChatMessage = ({
  chainId,
  senderAddress,
  encryptedSymmetricKey,
  addresses,
  message,
  isSender,
  timestamp,
  showDate,
  groupLastSeenTimestamp,
}: {
  chainId: string;
  senderAddress: string;
  encryptedSymmetricKey: string;
  addresses: NameAddress;
  isSender: boolean;
  message: string;
  timestamp: number;
  showDate: boolean;
  groupLastSeenTimestamp: number;
}) => {
  const [
    decryptedMessage,
    setDecryptedMessage,
  ] = useState<GroupMessagePayload>();

  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  useEffect(() => {
    async function loadDecryptedMessage() {
      const decryptedMsg = await decryptGroupMessage(
        message,
        chainId,
        encryptedSymmetricKey
      );
      setDecryptedMessage(decryptedMsg);
    }
    loadDecryptedMessage();
  }, [chainId, message]);

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

  return (
    <>
      <div className={style.currentDateContainer}>
        {" "}
        {showDate ? (
          <span className={style.currentDate}>{getDate(timestamp)}</span>
        ) : null}
      </div>
      {decryptedMessage &&
      (decryptedMessage.type == GroupMessageType.event.toString() ||
        decryptedMessage.type === GroupMessageType[GroupMessageType.event]) ? (
        <div className={style.currentEventContainer}>
          <span className={style.currentEvent}>
            {getEventMessage(
              accountInfo.bech32Address,
              addresses,
              decryptedMessage.message
            )}
          </span>
        </div>
      ) : (
        <div className={isSender ? style.senderAlign : style.receiverAlign}>
          <Container
            fluid
            className={classnames(style.messageBox, {
              [style.senderBox]: isSender,
            })}
          >
            {!isSender && (
              <div className={style.title}>
                {getUserName(
                  accountInfo.bech32Address,
                  addresses,
                  senderAddress
                )}
              </div>
            )}
            {!decryptedMessage ? (
              <i className="fas fa-spinner fa-spin ml-1" />
            ) : (
              <div className={style.message}>{decryptedMessage.message}</div>
            )}
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
      )}
    </>
  );
};
