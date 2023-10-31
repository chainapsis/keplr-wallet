import { HeaderLayout } from "@layouts/index";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { GovProposalsTab } from "./gov-proposals";
import { LatestBlock } from "./latest-block";
import { NativeTab } from "./native";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import { NativeEthTab } from "./native-eth";

export const ActivityPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [latestBlock, setLatestBlock] = useState<string>();
  const { chainStore } = useStore();
  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  const [activeTab, setActiveTab] = useState(isEvm ? "eth" : "native");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const tabs = () => {
    return (
      <React.Fragment>
        <div
          className={`${style["tab"]} ${
            activeTab === "native" ? style["active"] : ""
          }`}
          onClick={() => handleTabClick("native")}
        >
          Transactions
        </div>
        <div
          className={`${style["tab"]} ${
            activeTab === "gov" ? style["active"] : ""
          }`}
          onClick={() => handleTabClick("gov")}
        >
          Gov Proposals
        </div>
      </React.Fragment>
    );
  };

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.activity",
      })}
      onBackButton={() => {
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <div className={style["title"]}>
          <FormattedMessage id="main.menu.activity" />
          {!isEvm && (
            <LatestBlock
              latestBlock={latestBlock}
              setLatestBlock={setLatestBlock}
            />
          )}
        </div>
        {!isEvm && <div className={style["tabContainer"]}>{tabs()}</div>}
        {activeTab === "native" && <NativeTab latestBlock={latestBlock} />}
        {activeTab === "gov" && <GovProposalsTab latestBlock={latestBlock} />}
        {activeTab === "eth" && <NativeEthTab />}
      </div>
    </HeaderLayout>
  );
});
