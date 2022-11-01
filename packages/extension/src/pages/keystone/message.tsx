import React from "react";
import { Button } from "reactstrap";
import style from "./style.module.scss";

interface Props {
  type?: "error";
  onClose(): void;
  children: any;
}

export function Message({ type, onClose, children }: Props) {
  return (
    <div className={style.modal}>
      <div className={style["modal-content"]}>
        {type && (
          <img
            className={style["message-icon"]}
            src={require(`../../public/assets/svg/${type}.svg`)}
            height="64"
          />
        )}
        <div className={style["message-content"]}>{children}</div>
        <Button
          className={style["message-button"]}
          color="primary"
          block
          onClick={onClose}
        >
          OK
        </Button>
      </div>
    </div>
  );
}
