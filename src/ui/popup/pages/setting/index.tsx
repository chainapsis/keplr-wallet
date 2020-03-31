import React, { FunctionComponent, useCallback } from "react";
import { HeaderLayout } from "../../layouts/header-layout";
import { useHistory } from "react-router";
import { PageButton } from "./page-button";

import style from "./style.module.scss";
import { useLanguage } from "../../language";

export const SettingPage: FunctionComponent = () => {
  const language = useLanguage();
  const history = useHistory();

  const paragraphLang = language.automatic
    ? `Automatic (${language.language})`
    : language.language;

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Setting"
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <PageButton
          title="Language"
          paragraph={paragraphLang}
          onClick={useCallback(() => {
            history.push({
              pathname: "/setting/language"
            });
          }, [history])}
        />
        <PageButton
          title="Manage Connections"
          paragraph="2 websites has permissions"
        />
      </div>
    </HeaderLayout>
  );
};
