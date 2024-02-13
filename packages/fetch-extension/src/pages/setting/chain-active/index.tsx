import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import style from "../style.module.scss";
import { PageButton } from "../page-button";
import { Button } from "reactstrap";

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

  const { chainStore, analyticsStore } = useStore();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.chain-active.title",
      })}
      onBackButton={() => {
        navigate(-1);
        analyticsStore.logEvent("back_click", { pageName: "Show/Hide Chains" });
      }}
    >
      <Button
        text="Add New Evm Chain"
        color="primary"
        size="medium"
        style={{ width: "100%" }}
        onClick={() => {
          navigate("/setting/addEvmChain");
          analyticsStore.logEvent("add_new_evm_chain_click");
        }}
      >
        Add New Evm Chain
      </Button>
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
