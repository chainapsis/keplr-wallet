import { GroupChatOptions } from "@chatTypes";
import { ChatOption } from "@components/chat-option";
import React from "react";
import style from "./style.module.scss";

export const GroupChatActionsDropdown = ({
  showDropdown,
  handleClick,
  isAdmin,
  isMemberRemoved,
}: {
  showDropdown: boolean;
  isAdmin: boolean;
  isMemberRemoved: boolean;
  handleClick: (option: GroupChatOptions) => void;
}) => {
  const options = [
    { title: "Group info", option: GroupChatOptions.groupInfo },
    //{ title: "Mute group", option: GroupChatOptions.muteGroup },
  ];

  /// Add Leave group option when member info available in group detail
  if (!isMemberRemoved) {
    options.push({ title: "Leave group", option: GroupChatOptions.leaveGroup });
  }

  if (isAdmin && !isMemberRemoved) {
    options.push({
      title: "Chat settings",
      option: GroupChatOptions.chatSettings,
    });
  }

  if (isMemberRemoved) {
    options.push({
      title: "Delete group",
      option: GroupChatOptions.deleteGroup,
    });
  }

  return (
    <>
      {showDropdown && (
        <div className={style.dropdown}>
          {options.map(({ title, option }) => (
            <ChatOption
              key={title}
              title={title}
              onClick={() => handleClick(option)}
            />
          ))}
        </div>
      )}
    </>
  );
};
