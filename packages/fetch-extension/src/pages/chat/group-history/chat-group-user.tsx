import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import rightArrowIcon from "@assets/icon/right-arrow.png";
import style from "../style.module.scss";
import { Group, GroupMessagePayload, NameAddress } from "@chatTypes";
import { decryptGroupMessage } from "@utils/decrypt-group";
import { GroupMessageType } from "@utils/encrypt-group";
import { getUserName, getEventMessage } from "@utils/index";
import { useStore } from "../../../stores";
import parse from "react-html-parser";
import { processHyperlinks } from "@utils/process-hyperlinks";

export const ChatGroupUser: React.FC<{
  chainId: string;
  group: Group;
  encryptedSymmetricKey: string;
  addresses: NameAddress;
}> = ({ chainId, group, encryptedSymmetricKey, addresses }) => {
  const [decryptedMessage, setDecryptedMessage] =
    useState<GroupMessagePayload>();
  const navigate = useNavigate();

  const { chainStore, accountStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const handleClick = () => {
    analyticsStore.logEvent("Open Group click", {
      pageName: "Chat history",
    });
    navigate(`/chat/group-chat-section/${group.id}`);
  };

  useEffect(() => {
    async function loadDecryptedMessage() {
      const decryptedMsg = await decryptGroupMessage(
        group.lastMessageContents,
        chainId,
        encryptedSymmetricKey
      );
      setDecryptedMessage(decryptedMsg);
    }
    if (group) {
      loadDecryptedMessage();
    }
  }, [chainId, encryptedSymmetricKey, group]);

  function getLastMessage(): string {
    return `${getUserName(
      accountInfo.bech32Address,
      addresses,
      group.lastMessageSender
    )}: ${decryptedMessage?.message}`;
  }

  return (
    <div
      className={style["group"]}
      style={{ position: "relative" }}
      onClick={handleClick}
    >
      {/* {Number(sender?.lastSeenTimestamp) <
        Number(receiver?.lastSeenTimestamp) &&
        group.lastMessageSender === targetAddress &&
        Number(group.lastMessageTimestamp) >
          Number(sender?.lastSeenTimestamp) && (
          <span
            style={{
              height: "12px",
              width: "12px",
              backgroundColor: "#d027e5",
              borderRadius: "20px",
              bottom: "20px",
              left: "6px",
              position: "absolute",
              zIndex: 1,
            }}
          />
        )} */}
      <div className={style["initials"]}>
        <img
          className={style["groupImage"]}
          src={require("@assets/group710.svg")}
        />
      </div>
      <div className={style["messageInner"]}>
        <div className={style["name"]}>{group.name}</div>
        <div
          className={style["messageText"]}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {decryptedMessage &&
          (decryptedMessage.type == GroupMessageType.event.toString() ||
            decryptedMessage.type === GroupMessageType[GroupMessageType.event])
            ? parse(
                getEventMessage(
                  accountInfo.bech32Address,
                  addresses,
                  processHyperlinks(decryptedMessage.message)
                )
              )
            : parse(processHyperlinks(getLastMessage()))}
        </div>
      </div>
      <div>
        <img src={rightArrowIcon} style={{ width: "80%" }} alt="message" />
      </div>
    </div>
  );
};
