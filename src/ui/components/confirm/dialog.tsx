import React, { FunctionComponent, useCallback } from "react";
import { Button } from "reactstrap";

import style from "./style.module.scss";

export const ConfirmDialog: FunctionComponent<{
  img?: React.ReactElement;
  title?: string;
  paragraph: string;

  onConfirm?: () => void;
  onReject?: () => void;
}> = ({ img: imgElement, title, paragraph, onConfirm, onReject }) => {
  return (
    <div className={style.dialog}>
      <div className={style.bodyContainer}>
        {imgElement ? imgElement : null}
        {title ? <h1>{title}</h1> : null}
        <p>{paragraph}</p>
      </div>
      <div className={style.buttons}>
        <Button
          type="button"
          size="sm"
          color="default"
          outline
          onClick={useCallback(
            e => {
              if (onReject) {
                onReject();
              }
              e.preventDefault();
            },
            [onReject]
          )}
        >
          No
        </Button>
        <Button
          type="button"
          size="sm"
          color="primary"
          onClick={useCallback(
            e => {
              if (onConfirm) {
                onConfirm();
              }
              e.preventDefault();
            },
            [onConfirm]
          )}
        >
          Yes
        </Button>
      </div>
    </div>
  );
};
