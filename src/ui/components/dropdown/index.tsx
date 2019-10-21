import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import classnames from "classnames";

import style from "./styles.module.scss";

export interface Props {
  title: string;
  isUp?: boolean;
}

export const Dropdown: FunctionComponent<Props> = ({
  title,
  isUp,
  children
}) => {
  const [showSelect, setShowSelect] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);

  function handleClickOutside(e: any) {
    if (ref && ref.current && !ref.current.contains(e.target)) {
      setShowSelect(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={classnames(
        "dropdown",
        style.dropdown,
        { "is-up": isUp },
        {
          "is-active": showSelect
        }
      )}
    >
      <div className="dropdown-trigger">
        <button
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={() => {
            setShowSelect(!showSelect);
          }}
          ref={ref}
        >
          <span>{title}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true" />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">{children}</div>
      </div>
    </div>
  );
};
