import React, { useState } from "react";
import { useHistory } from "react-router";
import { blockUser } from "../../graphQL/messages-api";
import style from "./style.module.scss";

export const BlockUserPopup = ({
  setConfirmAction,
}: {
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [processing, setProcessing] = useState(false);
  const history = useHistory();
  const userName = history.location.pathname.split("/")[2];
  const handleBlock = async () => {
    setProcessing(true);
    try {
      await blockUser(userName);
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
        <h4>Block User</h4>
        <section>
          <p className={style.textContainer}>
            This contact will not be able to send you messages. The contact will
            not be notified.
          </p>
          {/* <div className={style.textContainer}>
          <input type="checkbox" id="check" />
          <label htmlFor="check">Also report contact</label>
        </div> */}

          {/* <p className={style.textContainer}>
          The last 5 messages will be sent to Fetch.
        </p> */}
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
            Block
          </button>
        </div>
      </div>
    </>
  );
};
