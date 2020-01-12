import React, { FunctionComponent } from "react";

import classnames from "classnames";

import style from "./style.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { Link } from "react-router-dom";
import { Dropdown } from "../../../components/dropdown";

export const Header: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <nav className={classnames("level", "is-mobile", style.header)}>
      {/* Fake is needed because section may not fill all remaining screen.
          Fake make sure that header always fill screen. */}
      <div className={style.fake} />
      <div className="level-left">{chainStore.chainInfo.chainId}</div>

      <div className="level-right">
        <Dropdown
          title={chainStore.chainInfo.chainName}
          isRight
          className={style.dropdown}
        >
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
    </nav>
  );
});
