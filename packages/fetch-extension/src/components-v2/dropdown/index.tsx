import React from "react";
import style from "./style.module.scss";

export interface DropdownProps {
  isOpen?: boolean;
  title: string;
  setIsOpen?: any;
  closeClicked: any;
  styleProp?: any;
  showCloseIcon?: boolean;
  showTopNav?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  title,
  setIsOpen,
  isOpen,
  closeClicked,
  styleProp,
  showCloseIcon = true,
  showTopNav,
}) => {
  return isOpen ? (
    <React.Fragment>
      <div
        style={showTopNav ? { top: "62px" } : {}}
        className={style["overlay"]}
      />
      <div style={styleProp} className={style["dropdownContainer"]}>
        <div className={style["header"]}>
          {title}
          {showCloseIcon && (
            <img
              className={style["closeIcon"]}
              onClick={() => {
                closeClicked();
                setIsOpen(false);
              }}
              src={require("@assets/svg/wireframe/close.svg")}
            />
          )}
        </div>
        {children}
      </div>
    </React.Fragment>
  ) : null;
};
