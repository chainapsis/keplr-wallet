import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";

import { Dropdown } from "../../../components/dropdown";

import classnames from "classnames";

import style from "./styles.module.scss";
import { useStore } from "../../stores";
import { observer } from "mobx-react";

export const Sidebar: FunctionComponent = observer(({ children }) => {
  const { chainStore } = useStore();

  return (
    <div className={style.container}>
      <div className={style.topContainer}>Title</div>
      <div className={style.middleContainer}>
        <aside className="menu">
          <ul className="menu-list">
            {React.Children.map(children, child => {
              return <li>{child}</li>;
            })}
          </ul>
        </aside>
      </div>
      <div className={style.bottomContainer}>
        <Dropdown title={chainStore.chainInfo.chainName} isUp>
          {chainStore.chainList.map(chainInfo => {
            const title = `${chainInfo.chainName} (${chainInfo.chainId})`;
            return (
              <Link
                to={`/${chainInfo.chainId}`}
                className={classnames("dropdown-item", {
                  "is-active":
                    chainStore.chainInfo.chainId === chainInfo.chainId
                })}
                key={title}
              >
                {title}
              </Link>
            );
          })}
        </Dropdown>
      </div>
    </div>
  );
});
