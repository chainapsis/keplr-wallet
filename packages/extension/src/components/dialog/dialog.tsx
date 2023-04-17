import React, { FunctionComponent, useRef } from "react";
import { useClickOutside } from "../../hooks";
import { DialogProps } from "./types";
import { Styles } from "./styles";
import { Modal } from "../modal";
import { Column, Columns } from "../column";
import { Button } from "../button";
import { TextButton } from "../button-text";

export const Dialog: FunctionComponent<DialogProps> = ({
  isOpen,
  setIsOpen,
  title,
  paragraph,
  onClickCancel,
  onClickYes,
}) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  useClickOutside(wrapperRef, () => setIsOpen(false));

  return (
    <Modal isOpen={isOpen} yAlign="center">
      <Styles.Container ref={wrapperRef}>
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
