import React, { FunctionComponent, useEffect, useState } from "react";
import { Label, Input as ReactStrapInput } from "reactstrap";
import style from "./mnemonic-input.module.scss";

export interface MnemonicInputProps {
  index: number;
  handlePasteClipboard: (event: any) => void;
  updateMnemonicValues: (value: string) => void;
  pastingValue?: string;
}

export const MnemonicInput: FunctionComponent<MnemonicInputProps> = ({
  index,
  handlePasteClipboard,
  updateMnemonicValues,
  pastingValue,
}) => {
  const [isEyeOff, setIsEyeOff] = useState(true);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (pastingValue) {
      setValue(pastingValue);
    }
  }, [pastingValue]);

  return (
    <div className={style.mnemonicInputGroup}>
      <Label for={`mnemonic-${index}`}>{index}.</Label>
      <ReactStrapInput
        type={isEyeOff ? "password" : "text"}
        id={`mnemonic-${index}`}
        name={`mnemonic-${index}`}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          updateMnemonicValues(event.target.value);
        }}
        onPaste={handlePasteClipboard}
      />
      <div
        className={style.inputTypeToggle}
        onClick={() => setIsEyeOff(!isEyeOff)}
      >
        <img
          src={require(`../../public/assets/img/${
            isEyeOff ? "eye-off" : "eye-on"
          }.svg`)}
        />
      </div>
    </div>
  );
};
