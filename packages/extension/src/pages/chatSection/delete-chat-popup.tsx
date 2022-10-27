import React from "react";
import style from "./style.module.scss";

export const DeleteChatPopup = ({
  setConfirmAction,
}: {
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleDelete = () => {
    setConfirmAction(false);
  };

  const handleCancel = () => {
    setConfirmAction(false);
  };

  return (
    <div className={style.popup}>
      <h4>Delete Chat</h4>
      <section>
        <p className={style.textContainer}>
          You will lose all your messages in this chat. This action cannot be
          undone
        </p>
      </section>
      <div className={style.buttonContainer}>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" className={style.btn} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};
