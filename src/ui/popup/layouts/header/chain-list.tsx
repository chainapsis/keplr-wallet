import React, { FunctionComponent } from "react";
import classnames from "classnames";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./chain-list.module.scss";

export const ChainList: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const mainChainList = chainStore.chainList.filter(
    chainInfo => !chainInfo.beta
  );
  const betaChainList = chainStore.chainList.filter(
    chainInfo => chainInfo.beta
  );

  return (
    <div className={style.chainListContainer}>
      {mainChainList.map((chainInfo, i) => (
        <div
          key={i}
          className={classnames({
            [style.chainName]: true,
            selected: chainInfo.chainId === chainStore.chainInfo.chainId
          })}
          onClick={() => {
            if (chainInfo.chainId !== chainStore.chainInfo.chainId) {
              chainStore.setChain(chainInfo.chainId);
              chainStore.saveLastViewChainId();
            }
          }}
        >
          {chainInfo.chainName}
        </div>
      ))}
      {betaChainList.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <hr
            className="my-3"
            style={{
              flex: 1,
              borderTop: "1px solid rgba(255, 255, 255)"
            }}
          />
          <div
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255)",
              margin: "0 8px"
            }}
          >
            Beta support
          </div>
          <hr
            className="my-3"
            style={{
              flex: 1,
              borderTop: "1px solid rgba(255, 255, 255)"
            }}
          />
        </div>
      ) : null}
      {betaChainList.map((chainInfo, i) => (
        <div
          key={i}
          className={classnames({
            [style.chainName]: true,
            selected: chainInfo.chainId === chainStore.chainInfo.chainId
          })}
          onClick={() => {
            if (chainInfo.chainId !== chainStore.chainInfo.chainId) {
              chainStore.setChain(chainInfo.chainId);
              chainStore.saveLastViewChainId();
            }
          }}
        >
          {chainInfo.chainName}
        </div>
      ))}
    </div>
  );
});
