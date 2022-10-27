import React from "react";
import { BlockUserPopup } from "./block-user-popup";
import { DeleteChatPopup } from "./delete-chat-popup";
import { UnblockUserPopup } from "./unblock-user-popup";

export const ActionsPopup = ({
  action,
  setConfirmAction,
}: {
  action: string;
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      {action === "block" && (
        <BlockUserPopup setConfirmAction={setConfirmAction} />
      )}
      {action === "unblock" && (
        <UnblockUserPopup setConfirmAction={setConfirmAction} />
      )}
      {action === "delete" && (
        <DeleteChatPopup setConfirmAction={setConfirmAction} />
      )}
    </>
  );
};
