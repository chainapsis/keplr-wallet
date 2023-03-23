import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import ReactHtmlParser from "react-html-parser";
import jazzicon from "@metamask/jazzicon";
import { NotyphiOrganisation } from "@notificationTypes";
import classnames from "classnames";

interface Props {
  elem: NotyphiOrganisation;
  handleCheck: (isChecked: boolean) => void;
  isChecked: boolean;
}

export const NotificationOrg: FunctionComponent<Props> = (props) => {
  const { elem, handleCheck, isChecked } = props;

  return (
    <div className={style.listItem}>
      <input
        className={style.checkbox}
        key={elem.id}
        onChange={() => handleCheck(!isChecked)}
        type="checkbox"
        id={elem.id}
        checked={isChecked}
      />
      <div className={style.image}>
        {elem.logo_href ? (
          <img draggable={false} src={elem.logo_href} />
        ) : (
          ReactHtmlParser(jazzicon(28, elem.id).outerHTML)
        )}
      </div>
      <p
        className={classnames(
          isChecked ? style.selectedName : style.unselectedName,
          style.name
        )}
      >
        {elem.name}
      </p>
    </div>
  );
};
