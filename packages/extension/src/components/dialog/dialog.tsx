import React, { FunctionComponent } from "react";
import { DialogProps } from "./types";
import { Styles } from "./styles";

import { Column, Columns } from "../column";
import { Button } from "../button";
import { TextButton } from "../button-text";
import { Modal } from "../modal/v2";

export const Dialog: FunctionComponent<DialogProps> = ({
  isOpen,
  setIsOpen,
  title,
  paragraph,
  onClickCancel,
  onClickYes,
}) => {
  return (
    <Modal isOpen={isOpen} align="center" close={() => setIsOpen(false)}>
      <Styles.Container>
        {title ? <Styles.Title>{title}</Styles.Title> : null}
        {paragraph ? <Styles.Paragraph>{paragraph}</Styles.Paragraph> : null}

        <Columns sum={1} gutter="0.75rem">
          <Column weight={1} />
          {onClickCancel ? (
            <TextButton text="Cancel" size="small" onClick={onClickCancel} />
          ) : null}
          {onClickYes ? (
            <Button
              text="Yes"
              color="primary"
              size="small"
              onClick={onClickYes}
            />
          ) : null}
        </Columns>
      </Styles.Container>
    </Modal>
  );
};
