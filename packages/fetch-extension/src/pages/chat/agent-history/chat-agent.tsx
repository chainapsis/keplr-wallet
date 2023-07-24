import rightArrowIcon from "@assets/icon/right-arrow.png";
import { Group, GroupAddress } from "@chatTypes";
import { decryptGroupTimestamp } from "@utils/decrypt-group";
import { decryptMessage } from "@utils/decrypt-message";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import style from "../style.module.scss";
import parse from "react-html-parser";
import { processHyperlinks } from "@utils/process-hyperlinks";
import { useStore } from "../../../stores";

export const ChatAgent: React.FC<{
  chainId: string;
  group: Group;
  contactName: string;
  targetAddress: string;
}> = ({ chainId, group, contactName, targetAddress }) => {
  const [message, setMessage] = useState("");
  // const [groupData, setGroupData] = useState(group);
  const { analyticsStore } = useStore();

  const navigate = useNavigate();

  const handleClick = () => {
    analyticsStore.logEvent("Open Agent click", {
      pageName: "Chat history",
    });
    navigate(`/chat/agent/${targetAddress}`);
  };

  /// Current wallet user
  // const sender = groupData?.addresses.find(
  //   (val) => val?.address !== targetAddress
  // );
  // /// Target user
  // const receiver = groupData?.addresses.find(
  //   (val) => val?.address === targetAddress
  // );

  const decryptGrpAddresses = async (
    groupAddress: GroupAddress,
    isSender: boolean
  ) => {
    if (groupAddress && groupAddress.groupLastSeenTimestamp) {
      const data = await decryptGroupTimestamp(
        chainId,
        groupAddress.groupLastSeenTimestamp,
        isSender
      );

      Object.assign(groupAddress, {
        groupLastSeenTimestamp: new Date(data).getTime(),
      });
    }
    if (groupAddress && groupAddress.lastSeenTimestamp) {
      const data = await decryptGroupTimestamp(
        chainId,
        groupAddress.lastSeenTimestamp,
        isSender
      );
      Object.assign(groupAddress, {
        lastSeenTimestamp: new Date(data).getTime(),
      });
    }

    return groupAddress;
  };

  const decryptGrp = async (group: Group) => {
    const tempGroup = { ...group };
    let tempSenderAddress: GroupAddress | undefined;
    let tempReceiverAddress: GroupAddress | undefined;

    /// Shallow copy
    /// Decrypting sender data
    const senderAddress = {
      ...group.addresses.find((val) => val.address !== targetAddress),
    };
    if (senderAddress)
      tempSenderAddress = await decryptGrpAddresses(
        senderAddress as GroupAddress,
        group.lastMessageSender === targetAddress
      );

    /// Decrypting receiver data
    const receiverAddress = {
      ...group.addresses.find((val) => val.address === targetAddress),
    };
    if (receiverAddress)
      tempReceiverAddress = await decryptGrpAddresses(
        receiverAddress as GroupAddress,
        group.lastMessageSender !== targetAddress
      );

    /// Storing decryptin address into the group object and updating the UI
    if (tempSenderAddress && tempReceiverAddress) {
      const tempGroupAddress = [tempSenderAddress, tempReceiverAddress];
      tempGroup.addresses = tempGroupAddress;
      // setGroupData(tempGroup);
    }
  };

  const decryptMsg = async (
    chainId: string,
    contents: string,
    isSender: boolean
  ) => {
    const message = await decryptMessage(chainId, contents, isSender);
    if (message.type == 1) {
      setMessage(message.content.text);
      return;
    }

    setMessage(
      "Please recheck parameters of the transaction in Data Tab before approving the transaction."
    );
  };

  useEffect(() => {
    if (group) {
      decryptMsg(
        chainId,
        group.lastMessageContents,
        group.lastMessageSender !== targetAddress
      );
      decryptGrp(group);
    }
  }, [chainId, targetAddress, group]);

  return (
    <div
      className={style["group"]}
      style={{ position: "relative" }}
      onClick={handleClick}
    >
      <img src={require("@assets/svg/fetchbot.svg")} width="40px" />
      <div className={style["messageInner"]}>
        <div className={style["name"]}>{contactName}</div>
        <div
          className={style["messageText"]}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {typeof message == "string"
            ? parse(processHyperlinks(message))
            : message}
        </div>
      </div>
      <div>
        <img src={rightArrowIcon} style={{ width: "80%" }} alt="message" />
      </div>
    </div>
  );
};
