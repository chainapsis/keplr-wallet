import React, { FunctionComponent } from "react";
import { CheckBoxProps, MinusIcon, CheckIcon } from "./index";
import { Styles } from "./styles";

export const Checkbox: FunctionComponent<CheckBoxProps> = ({
  size = "large",
  checked = false,
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = React.useState(checked);
  const iconSize = size === "small" ? "0.625rem" : "1rem";

  return (
    <Styles.CheckBoxContainer
      size={size}
      checked={isChecked}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setIsChecked(!isChecked);
        }
      }}
    >
      <Styles.HiddenCheckBox checked={isChecked} disabled={disabled} />
      {isChecked ? (
        <CheckIcon width={iconSize} height={iconSize} />
      ) : disabled ? (
        <MinusIcon width={iconSize} height={iconSize} />
      ) : null}
    </Styles.CheckBoxContainer>
  );
};
