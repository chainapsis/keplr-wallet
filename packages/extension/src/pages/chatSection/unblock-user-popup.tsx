import React, { useState } from "react";
import { useHistory } from "react-router";
import { unblockUser } from "../../graphQL/messages-api";
import style from "./style.module.scss";

export const UnblockUserPopup = ({
  setConfirmAction,
}: {
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [processing, setProcessing] = useState(false);
  const history = useHistory();
  const userName = history.location.pathname.split("/")[2];
  const handleUnblock = async () => {
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
            This contact will be able to send you messages. The contact will not
            be notified.
          </p>
        </section>
        <div className={style.buttonContainer}>
          <button type="button" onClick={handleCancel} disabled={processing}>
            Cancel
          </button>
          <button
            type="button"
            className={style.btn}
            onClick={handleUnblock}
            disabled={processing}
          >
            Unblock
          </button>
        </div>
      </div>
    </>
  );
};
