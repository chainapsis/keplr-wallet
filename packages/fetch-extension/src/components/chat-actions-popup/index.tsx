import { CommonPopupOptions } from "@chatTypes";
import React, { useState } from "react";
import { useLocation } from "react-router";
import { AlertPopup } from "./alert-popup";
import { BlockUserPopup } from "./block-user-popup";
import { DeleteChatPopup } from "./delete-chat-popup";
import { DeleteGroupPopup } from "./delete-group-popup";
import { UnblockUserPopup } from "./unblock-user-popup";

export const ChatActionsPopup = ({
  action,
  setConfirmAction,
  handleAction,
}: {
  action: string;
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
  handleAction?: () => void;
}) => {
  const [processing, setProcessing] = useState(false);
  /// Target address for one to one chat
  const targetAddress = useLocation().pathname.split("/")[2];

  const handleLeaveGroup = async () => {
    setProcessing(true);
    if (handleAction) handleAction();
  };

  return (
    <React.Fragment>
      {action === "block" && (
        <BlockUserPopup setConfirmAction={setConfirmAction} />
      )}
      {action === "unblock" && (
        <UnblockUserPopup
          setConfirmAction={setConfirmAction}
          userName={targetAddress}
        />
      )}
      {action === "delete" && (
        <DeleteChatPopup setConfirmAction={setConfirmAction} />
      )}
      {action === "deleteGroup" && (
        <DeleteGroupPopup setConfirmAction={setConfirmAction} />
      )}
      {action === "leaveGroup" && (
        <AlertPopup
          setConfirmAction={setConfirmAction}
          heading={"Leave Group Chat?"}
          description={
            "You won’t receive further messages from this group. \nThe group will be notified that you have left."
          }
          firstButtonTitle="Cancel"
          secondButtonTitle="Leave"
          processing={processing}
          onClick={(action: CommonPopupOptions) => {
            if (action === CommonPopupOptions.ok) {
              handleLeaveGroup();
            } else {
              setConfirmAction(false);
            }
          }}
        />
      )}
    </React.Fragment>
  );
};
