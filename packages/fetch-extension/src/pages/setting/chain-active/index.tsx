import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import style from "../style.module.scss";
import { PageButton } from "../page-button";

const ChainItem: FunctionComponent<{
  chainName: string;
  disabled: boolean;
  onClick: () => void;
}> = ({ chainName, disabled, onClick }) => {
  return (
    <PageButton
      title={chainName}
      onClick={onClick}
      icons={[
        <label
          key="toggle"
          className="custom-toggle"
          style={{ marginBottom: 0 }}
        >
          <input type="checkbox" checked={!disabled} />
          <span className="custom-toggle-slider rounded-circle" />
        </label>,
      ]}
    />
  );
};

export const ChainActivePage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const { chainStore } = useStore();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.chain-active.title",
      })}
      onBackButton={() => {
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        {chainStore.chainInfosWithUIConfig.map((chainInfoUI) => (
          <ChainItem
            key={chainInfoUI.chainInfo.chainId}
            chainName={chainInfoUI.chainInfo.chainName}
            disabled={chainInfoUI.disabled}
            onClick={async () => {
              await chainStore.toggleChainInfoInUI(
                chainInfoUI.chainInfo.chainId
              );
            }}
          />
        ))}
      </div>
    </HeaderLayout>
  );
});
