import React from "react";
import style from "./style.module.scss";

export const MessagePopup = ({
  handleCancel,
  message,
}: {
  handleCancel?: any;
  message: string;
}) => {
  return (
    <React.Fragment>
      <div className={style["popupCard"]}>
        <div className={style["errorText"]}>
          <h3 style={{ color: "white" }}>{message}</h3>
        </div>
        {handleCancel && (
          <button type="button" onClick={handleCancel}>
            cancel
          </button>
        )}
      </div>
    </React.Fragment>
  );
};
