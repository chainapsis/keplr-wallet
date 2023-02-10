import React from "react";
import style from "./style.module.scss";
import { CommonPopupOptions } from "@chatTypes";
export const AlertPopup = ({
  heading,
  description,
  firstButtonTitle,
  secondButtonTitle,
  processing,
  onClick,
}: {
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
  heading: string;
  description: string;
  firstButtonTitle: string;
  secondButtonTitle: string;
  processing?: boolean;
  onClick: (option: CommonPopupOptions) => void;
}) => {
  return (
    <>
      <div className={style.overlay} />
      <div className={style.popup}>
        <h4>{heading}</h4>
        <section>
          <p style={{ whiteSpace: "pre-wrap" }} className={style.textContainer}>
            {description}
          </p>
        </section>
        <div className={style.buttonContainer}>
          <button
            type="button"
            disabled={processing}
            onClick={() => onClick(CommonPopupOptions.cancel)}
          >
            {firstButtonTitle}
          </button>
          <button
            type="button"
            className={style.btn}
            disabled={processing}
            onClick={() => onClick(CommonPopupOptions.ok)}
          >
            {secondButtonTitle}
          </button>
        </div>
      </div>
    </>
  );
};
