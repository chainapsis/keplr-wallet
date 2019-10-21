import React, { FunctionComponent } from "react";
import classnames from "classnames";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./chain-list.module.scss";

export const ChainList: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <div className={style.chainListContainer}>
      {chainStore.chainList.map((chainInfo, i) => (
        <div
          key={i}
          className={classnames({
            [style.chainName]: true,
            selected: chainInfo.chainId === chainStore.chainInfo.chainId
          })}
          onClick={() => {
            if (chainInfo.chainId !== chainStore.chainInfo.chainId) {
              chainStore.setChain(chainInfo.chainId);
            }
          }}
        >
          {chainInfo.chainName}
        </div>
      ))}
    </div>
  );
});
