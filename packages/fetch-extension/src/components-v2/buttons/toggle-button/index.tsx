import React, { useState } from "react";
import style from "./style.module.scss";

export interface ButtonToggleProps {
  label: string;
  content: any;
}

export const ButtonToggle = ({ label, content }: ButtonToggleProps) => {
  const [isButtonToggletOpen, setIsButtonToggletOpen] = useState(false);
  return (
    <div>
      <button
        className={style["toggleBotton"]}
        onClick={(e) => {
          e.preventDefault();
          setIsButtonToggletOpen(!isButtonToggletOpen);
        }}
        style={isButtonToggletOpen ? { border: "1px solid white" } : {}}
      >
        {label}
      </button>
      {isButtonToggletOpen && <div> {content}</div>}
    </div>
  );
};
