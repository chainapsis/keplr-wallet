import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import classnames from "classnames";

export interface Props {
  className?: string;
  title: string;
  isUp?: boolean;
  isRight?: boolean;
}

export const Dropdown: FunctionComponent<Props> = ({
  className,
  title,
  isUp,
  isRight,
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

  const dropdownOnClick = useCallback(() => {
    setShowSelect(!showSelect);
  }, [showSelect]);

  return (
    <div
      className={classnames(
        "dropdown",
        className,
        { "is-up": isUp },
        {
          "is-right": isRight
        },
        {
          "is-active": showSelect
        }
      )}
    >
      <div className="dropdown-trigger">
        <button
          className={classnames("button", className)}
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={dropdownOnClick}
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
