import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../layouts";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { PageButton } from "../page-button";

import style from "./style.module.scss";

export const CreditPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.credit",
      })}
      onBackButton={() => {
        navigate(-1);
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
