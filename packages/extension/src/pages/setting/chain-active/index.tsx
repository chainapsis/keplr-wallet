import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useStore } from "../../../stores";
import style from "../style.module.scss";
import { PageButton } from "../page-button";
import { ChainInfo } from "@keplr-wallet/types";

const ChainItem: FunctionComponent<{
  chainInfoUI: { chainInfo: ChainInfo; disabled: boolean };
  onClick: () => void;
}> = (props) => {
  const { chainInfoUI, onClick } = props;

  return (
    <PageButton
      title={chainInfoUI.chainInfo.chainName}
      key={chainInfoUI.chainInfo.chainId}
      onClick={onClick}
      icons={[
        <label
          key="toggle"
          className="custom-toggle"
          style={{ marginBottom: 0 }}
        >
          <input type="checkbox" checked={!chainInfoUI.disabled} />
          <span className="custom-toggle-slider rounded-circle" />
        </label>,
      ]}
    />
  );
};

export const ChainActivePage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const { chainStore } = useStore();

  const onClick = async (chainId: string) => {
    await chainStore.toggleChainInfoInUI(chainId);
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.chain-active.title",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        {chainStore.chainInfosWithUIConfig.map((chainInfoUI) => (
          <ChainItem
            key={chainInfoUI.chainInfo.chainId}
            chainInfoUI={chainInfoUI}
            onClick={() => onClick(chainInfoUI.chainInfo.chainId)}
          />
        ))}
      </div>
    </HeaderLayout>
  );
});
