import React, { FunctionComponent, useCallback } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { PageButton } from "../page-button";

import style from "../style.module.scss";
import { useLanguage } from "../../../language";
import { useHistory } from "react-router";

export const SettingLanguagePage: FunctionComponent = () => {
  const language = useLanguage();
  const history = useHistory();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Language"
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <PageButton
          title="Automatic"
          onClick={useCallback(() => {
            language.clearLanguage();
            history.push({
              pathname: "/"
            });
          }, [history, language])}
        />
        <PageButton
          title="English"
          onClick={useCallback(() => {
            language.setLanguage("en");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
        />
        <PageButton
          title="Korean"
          onClick={useCallback(() => {
            language.setLanguage("ko");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
        />
      </div>
    </HeaderLayout>
  );
};
