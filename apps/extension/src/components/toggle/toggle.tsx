import React, { FunctionComponent } from "react";
import { ToggleProps } from "./types";
import { Styles } from "./styles";
import { CheckToggleIcon } from "../icon";

export const Toggle: FunctionComponent<ToggleProps> = ({
  isOpen,
  setIsOpen,
  disabled,
  size = "large",
}) => {
  return (
    <Styles.Container
      isOpen={isOpen}
      onClick={() => (setIsOpen && !disabled ? setIsOpen(!isOpen) : null)}
      disabled={disabled}
      size={size}
    >
      <Styles.Circle isOpen={isOpen} disabled={disabled} size={size}>
        {isOpen && size !== "extra-small" ? (
          <CheckToggleIcon width="1rem" height="1rem" />
        ) : null}
      </Styles.Circle>
    </Styles.Container>
  );
};
