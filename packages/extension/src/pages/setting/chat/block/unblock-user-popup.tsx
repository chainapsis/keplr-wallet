import React, { useState } from "react";
import { unblockUser } from "../../../../graphQL/messages-api";
import style from "./style.module.scss";

export const UnblockUserPopup = ({
  userName,
  setConfirmAction,
}: {
  userName: string;
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [processing, setProcessing] = useState(false);

  const handleBlock = async () => {
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
    <>
      <div className={style.overlay} />
      <div className={style.popup}>
        <h4>Unblock User</h4>
        <section>
          <p className={style.textContainer}>
            This contact will not be able to send you messages. The contact will
            not be notified.
          </p>
        </section>
        <div className={style.buttonContainer}>
          <button type="button" onClick={handleCancel} disabled={processing}>
            Cancel
          </button>
          <button
            type="button"
            className={style.btn}
            onClick={handleBlock}
            disabled={processing}
          >
            Unblock
          </button>
        </div>
      </div>
    </>
  );
};
