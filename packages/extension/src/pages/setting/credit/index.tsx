import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts";
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
        id: "setting.credit",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <PageButton
          title="Entity Funding Support"
          paragraph="Provided by ICF"
          onClick={(e) => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://interchain.io",
            });
          }}
        />
        <PageButton
          title="Price data"
          paragraph="Provided by Coingecko API"
          onClick={(e) => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://www.coingecko.com/",
            });
          }}
        />
        <PageButton
          title="Development grant support"
          paragraph="Provided by grant.fish"
          onClick={(e) => {
            e.preventDefault();
            browser.tabs.create({
              url: "https://stake.fish",
            });
          }}
        />
      </div>
    </HeaderLayout>
  );
};
