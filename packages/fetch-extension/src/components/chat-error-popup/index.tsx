import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";

export const ChatErrorPopup = observer(() => {
  const { chatStore } = useStore();
  const errorMessage = chatStore.messagesStore.userMessagesError;
  const [confirmAction, setConfirmAction] = useState(false);

  useEffect(() => {
    setConfirmAction(true);
  }, [errorMessage]);

  const handleOk = () => {
    setConfirmAction(false);
    chatStore.messagesStore.setMessageError({
      type: "",
      message: "",
      level: 3,
    });
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
});
