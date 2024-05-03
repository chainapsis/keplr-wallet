import { HeaderLayout } from "@layouts-v2/header-layout";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { GovProposalsTab } from "./gov-proposals";
import { NativeTab } from "./native";
import style from "./style.module.scss";
import { useStore } from "../../stores";
import { TabsPanel } from "@components-v2/tabs/tabsPanel-2";

export const ActivityPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [latestBlock, _setLatestBlock] = useState<string>();
  const { analyticsStore } = useStore();
  const tab = [
    {
      id: "Transactions",
      component: <NativeTab latestBlock={latestBlock} />,
    },
    {
      id: "Gov Proposals",
      component: <GovProposalsTab latestBlock={latestBlock} />,
    },
  ];

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.activity",
      })}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", { pageName: "Activity" });
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <div className={style["title"]}>
          <FormattedMessage id="main.menu.activity" />
        </div>
        {
          <div style={{ width: "326px" }} className={style["tabContainer"]}>
            <TabsPanel tabs={tab} />
          </div>
        }
      </div>
    </HeaderLayout>
  );
});
