import React, { FunctionComponent } from "react";
import classnames from "classnames";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import style from "./chain-list.module.scss";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { useConfirm } from "../../components/confirm";
import { useIntl } from "react-intl";

const ChainElement: FunctionComponent<{
  chainInfo: ChainInfoWithCoreTypes;
}> = observer(({ chainInfo }) => {
  const { chainStore } = useStore();

  const intl = useIntl();

  const confirm = useConfirm();

  return (
    <div
      className={classnames({
        [style.chainName]: true,
        selected: chainInfo.chainId === chainStore.current.chainId,
      })}
      onClick={() => {
        if (chainInfo.chainId !== chainStore.current.chainId) {
          chainStore.selectChain(chainInfo.chainId);
          chainStore.saveLastViewChainId();
        }
      }}
    >
      {chainInfo.chainName}
      {!chainInfo.embeded &&
      chainStore.current.chainId !== chainInfo.chainId ? (
        <div className={style.removeBtn}>
          <i
            className="fas fa-times-circle"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                await confirm.confirm({
                  paragraph: intl.formatMessage(
                    {
                      id: "chain.remove.confirm.paragraph",
                    },
                    {
                      chainName: chainInfo.chainName,
                    }
                  ),
                })
              ) {
                await chainStore.removeChainInfo(chainInfo.chainId);
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
});

const Divider: FunctionComponent = (props) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <hr
        className="my-3"
        style={{
          flex: 1,
          borderTop: "1px solid #64646D",
        }}
      />
      {props.children ? (
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255)",
            margin: "0 8px",
          }}
        >
          {props.children}
        </div>
      ) : null}
      <hr
        className="my-3"
        style={{
          flex: 1,
          borderTop: "1px solid #64646D",
        }}
      />
    </div>
  );
};

const ArrowRightIcon: FunctionComponent = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.42188 3.9375L14.4844 9L9.42188 14.0625M13.7813 9L3.51563 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ChainList: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const mainChainList = chainStore.chainInfosInUI.filter(
    (chainInfo) => !chainInfo.beta
  );
  const betaChainList = chainStore.chainInfosInUI.filter(
    (chainInfo) => chainInfo.beta
  );

  return (
    <div className={style.chainListContainer}>
      {mainChainList.map((chainInfo) => (
        <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
      ))}
      {betaChainList.length > 0 ? <Divider>Beta support</Divider> : null}
      {betaChainList.map((chainInfo) => (
        <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
      ))}

      <Divider />
      <a
        href="https://chains.keplr.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={classnames(style.chainName, style.addChain)}>
          <div>chain.keplr.app</div>
          <div>
            <ArrowRightIcon />
          </div>
        </div>
      </a>
    </div>
  );
});
