import classnames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { store } from "@chatStore/index";
import {
  resetChatList,
  setIsChatSubscriptionActive,
} from "@chatStore/messages-slice";
import { resetUser } from "@chatStore/user-slice";
import { useConfirm } from "@components/confirm";
import { messageAndGroupListenerUnsubscribe } from "@graphQL/messages-api";
import { useStore } from "../../stores";
import style from "./chain-list.module.scss";
import { ChainInfoWithCoreTypes } from "@keplr-wallet/background";
import { resetProposals } from "@chatStore/proposal-slice";
const ChainElement: FunctionComponent<{
  chainInfo: ChainInfoWithCoreTypes;
}> = observer(({ chainInfo }) => {
  const { chainStore, analyticsStore } = useStore();
  const navigate = useNavigate();
  const intl = useIntl();

  const confirm = useConfirm();

  return (
    <div
      className={classnames({
        [style["chainName"]]: true,
        selected: chainInfo.chainId === chainStore.current.chainId,
      })}
      onClick={() => {
        let properties = {};
        if (chainInfo.chainId !== chainStore.current.chainId) {
          properties = {
            chainId: chainStore.current.chainId,
            chainName: chainStore.current.chainName,
            toChainId: chainInfo.chainId,
            toChainName: chainInfo.chainName,
          };
        }
        chainStore.selectChain(chainInfo.chainId);
        chainStore.saveLastViewChainId();
        store.dispatch(resetUser({}));
        store.dispatch(resetProposals({}));

        store.dispatch(resetChatList({}));
        store.dispatch(setIsChatSubscriptionActive(false));
        messageAndGroupListenerUnsubscribe();
        navigate("/");
        if (Object.values(properties).length > 0) {
          analyticsStore.logEvent("Chain changed", properties);
        }
      }}
    >
      {chainInfo.chainName}
      {!chainInfo.embeded &&
      chainStore.current.chainId !== chainInfo.chainId ? (
        <div className={style["removeBtn"]}>
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

export const ChainList: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const intl = useIntl();
  const navigate = useNavigate();

  const mainChainList = chainStore.chainInfosInUI.filter(
    (chainInfo) => !chainInfo.beta && !chainInfo.features?.includes("evm")
  );

  const evmChainList = chainStore.chainInfosInUI.filter((chainInfo) =>
    chainInfo.features?.includes("evm")
  );

  return (
    <div className={style["chainListContainer"]}>
      {evmChainList.length > 0 ? <Divider> Evm </Divider> : null}
      {evmChainList.map((chainInfo) => (
        <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
      ))}
      <Divider />
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate("/setting/addEvmChain");
        }}
        target="_blank"
        rel="noopener noreferrer"
        // style={{ display: "none" }}
      >
        <div className={classnames(style["chainName"], style["addChain"])}>
          <div>+ Add custom EVM network</div>
        </div>
      </a>
      <Divider> Cosmos </Divider>
      {mainChainList.map((chainInfo) => (
        <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
      ))}
      {/* {betaChainList.length > 0 ? <Divider>Beta support</Divider> : null}
      {betaChainList.map((chainInfo) => (
        <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
      ))} */}

      {/* <Divider /> */}
      <a
        href="https://chains.keplr.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "none" }}
      >
        <div className={classnames(style["chainName"], style["addChain"])}>
          <div>{intl.formatMessage({ id: "main.suggest.chain.link" })}</div>
        </div>
      </a>
    </div>
  );
});
