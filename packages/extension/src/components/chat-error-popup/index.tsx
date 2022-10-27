import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { useSelector } from "react-redux";
import { userMessagesError } from "../../chatStore/messages-slice";

export const ChatErrorPopup = () => {
  const errorMessage = useSelector(userMessagesError);
  const [confirmAction, setConfirmAction] = useState(false);

  useEffect(() => {
    setConfirmAction(true);
  }, [errorMessage]);

  const handleOk = () => {
    setConfirmAction(false);
  };

  return errorMessage?.message?.length && confirmAction ? (
    <>
      <div className={style.overlay} />
      <div className={style.popup}>
        <h4>Error</h4>
        <section className={style.textContainer}>
          {errorMessage.message}
        </section>
        {errorMessage.level < 2 && (
          <div className={style.buttonContainer}>
            <button type="button" onClick={handleOk}>
              Ok
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <></>
  );
};
