import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { useSelector } from "react-redux";
import { setMessageError, userMessagesError } from "@chatStore/messages-slice";
import { store } from "@chatStore/index";

export const ChatErrorPopup = () => {
  const errorMessage = useSelector(userMessagesError);
  const [confirmAction, setConfirmAction] = useState(false);

  useEffect(() => {
    setConfirmAction(true);
  }, [errorMessage]);

  const handleOk = () => {
    setConfirmAction(false);
    store.dispatch(
      setMessageError({
        type: "",
        message: "",
        level: 3,
      })
    );
  };

  return errorMessage?.message?.length && confirmAction ? (
    <React.Fragment>
      <div className={style["overlay"]} />
      <div className={style["popup"]}>
        <h4>Error</h4>
        <section className={style["textContainer"]}>
          {errorMessage.message}
        </section>
        {errorMessage.level < 2 && (
          <div className={style["buttonContainer"]}>
            <button type="button" onClick={handleOk}>
              Ok
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  ) : (
    <React.Fragment />
  );
};
