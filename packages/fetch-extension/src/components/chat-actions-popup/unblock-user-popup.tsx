import React, { useState } from "react";
import { unblockUser } from "@graphQL/messages-api";
import style from "./style.module.scss";
import { useStore } from "../../stores";

export const UnblockUserPopup = ({
  userName,
  setConfirmAction,
}: {
  userName: string;
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [processing, setProcessing] = useState(false);
  const { analyticsStore } = useStore();

  const handleUnblock = async () => {
    analyticsStore.logEvent("unblock_contact_click", {
      action: "Unblock",
    });
    setProcessing(true);
    try {
      await unblockUser(userName);
    } catch (e) {
      console.log(e);
    } finally {
      setProcessing(false);
      setConfirmAction(false);
    }
  };

  const handleCancel = () => {
    setConfirmAction(false);
  };

  return (
    <React.Fragment>
      <div className={style["overlay"]} />
      <div className={style["popup"]}>
        <h4>Unblock User</h4>
        <section>
          <p className={style["textContainer"]}>
            This contact will be able to send you messages. The contact will not
            be notified.
          </p>
        </section>
        <div className={style["buttonContainer"]}>
          <button type="button" onClick={handleCancel} disabled={processing}>
            Cancel
          </button>
          <button
            type="button"
            className={style["btn"]}
            onClick={handleUnblock}
            disabled={processing}
          >
            Unblock
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};
