import React from "react";
import style from "./style.module.scss";
import { GroupChatMemberOptions, GroupMembers } from "@chatTypes";
import { ChatOption } from "@components/chat-option";
import { formatAddress } from "@utils/format";

export const GroupChatPopup = ({
  name,
  selectedMember,
  isLoginUserAdmin,
  isAdded,
  isFromReview,
  onClick,
}: {
  name: string;
  selectedMember: GroupMembers | undefined;
  isLoginUserAdmin: boolean;
  isAdded: boolean;
  isFromReview: boolean;
  onClick: (option: GroupChatMemberOptions) => void;
}) => {
  return (
    <React.Fragment>
      <div
        className={style.overlay}
        onClick={() => onClick(GroupChatMemberOptions.dissmisPopup)}
      />
      <div className={style.popup}>
        <i
          className={"fa fa-times"}
          style={{
            width: "24px",
            height: "24px",
            cursor: "pointer",
            position: "absolute",
            float: "right",
            right: "0px",
            top: "10px",
          }}
          aria-hidden="true"
          onClick={() => onClick(GroupChatMemberOptions.dissmisPopup)}
        />
        {
          <ChatOption
            title={`Message ${formatAddress(name)}`}
            onClick={() => onClick(GroupChatMemberOptions.messageMember)}
          />
        }
        {isAdded ? (
          <ChatOption
            title={"View in Address Book"}
            onClick={() => onClick(GroupChatMemberOptions.viewInAddressBook)}
          />
        ) : (
          <ChatOption
            title={"Add to Address Book"}
            onClick={() => onClick(GroupChatMemberOptions.addToAddressBook)}
          />
        )}
        {isLoginUserAdmin && !selectedMember?.isAdmin && !isFromReview && (
          <ChatOption
            title={"Give admin status"}
            onClick={() => onClick(GroupChatMemberOptions.makeAdminStatus)}
          />
        )}
        {isLoginUserAdmin && selectedMember?.isAdmin && !isFromReview && (
          <ChatOption
            title={"Remove admin status"}
            onClick={() => onClick(GroupChatMemberOptions.removeAdminStatus)}
          />
        )}
        {isLoginUserAdmin && !isFromReview && (
          <ChatOption
            title={`Remove ${formatAddress(name)}`}
            onClick={() => onClick(GroupChatMemberOptions.removeMember)}
          />
        )}
      </div>
    </React.Fragment>
  );
};
