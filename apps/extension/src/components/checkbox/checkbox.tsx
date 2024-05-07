import React, { FunctionComponent } from "react";
import { CheckBoxProps, MinusIcon, CheckIcon } from "./index";
import { Styles } from "./styles";

export const Checkbox: FunctionComponent<CheckBoxProps> = ({
  size = "large",
  checked,
  onChange,
  disabled = false,
}) => {
  const iconSize = (() => {
    switch (size) {
      case "extra-small":
        return "0.5rem";
      case "small":
        return "0.625rem";
      default:
        return "1rem";
    }
  })();

  return (
    <Styles.CheckBoxContainer
      size={size}
      checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();

        if (!disabled) {
          onChange(!checked);
        }
      }}
    >
      <Styles.HiddenCheckBox defaultChecked={checked} disabled={disabled} />
      {checked ? (
        <CheckIcon width={iconSize} height={iconSize} />
      ) : disabled ? (
        <MinusIcon width={iconSize} height={iconSize} />
      ) : null}
    </Styles.CheckBoxContainer>
  );
};
