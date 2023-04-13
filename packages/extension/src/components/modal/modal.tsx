import React, { FunctionComponent } from "react";
import { ModalProps } from "./types";
import { Styles } from "./styles";

export const Modal: FunctionComponent<ModalProps> = ({
  isOpen,
  yAlign,
  height,
  children,
}) => {
  return (
    <Styles.Container isOpen={isOpen} yAlign={yAlign}>
      <Styles.Children height={height}>{children}</Styles.Children>
    </Styles.Container>
  );
};
