import React, { FunctionComponent, useCallback } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";
import { PageButton } from "../page-button";

import style from "./style.module.scss";

export const CreditPage: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.credit"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <PageButton
          title="Cosmos Hub node"
          paragraph="Provided by Figment Networks Datahub"
          onClick={useCallback(e => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://figment.network"
            });
          }, [])}
        />
        <PageButton
          title="Price data"
          paragraph="Provided by Coingecko API"
          onClick={useCallback(e => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://www.coingecko.com/"
            });
          }, [])}
        />
        <PageButton
          title="Development grant support"
          paragraph="Provided by grant.fish"
          onClick={useCallback(e => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://stake.fish"
            });
          }, [])}
        />
      </div>
    </HeaderLayout>
  );
};
