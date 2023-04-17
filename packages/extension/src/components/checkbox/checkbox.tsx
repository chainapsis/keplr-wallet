import React, { FunctionComponent } from "react";
import { CheckBoxProps, MinusIcon, CheckIcon } from "./index";
import { Styles } from "./styles";

export const Checkbox: FunctionComponent<CheckBoxProps> = ({
  size = "large",
  checked = false,
  disabled = false,
  onClick,
}) => {
  const iconSize = size === "small" ? "0.625rem" : "1rem";

  return (
    <Styles.CheckBoxContainer
      size={size}
      checked={checked}
      disabled={disabled}
      onClick={onClick}
    >
      <Styles.HiddenCheckBox checked={checked} disabled={disabled} />
      {checked ? (
        <CheckIcon width={iconSize} height={iconSize} />
      ) : disabled ? (
        <MinusIcon width={iconSize} height={iconSize} />
      ) : null}
    </Styles.CheckBoxContainer>
  );
};
