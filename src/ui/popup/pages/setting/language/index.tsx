import React, { FunctionComponent, useCallback, useMemo } from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { PageButton } from "../page-button";

import style from "../style.module.scss";
import { useLanguage } from "../../../language";
import { useHistory } from "react-router";
import { useIntl } from "react-intl";

export const SettingLanguagePage: FunctionComponent = () => {
  const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();

  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.language"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.automatic"
          })}
          onClick={useCallback(() => {
            language.clearLanguage();
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={language.automatic ? selectedIcon : undefined}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.en"
          })}
          onClick={useCallback(() => {
            language.setLanguage("en");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "en"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.ko"
          })}
          onClick={useCallback(() => {
            language.setLanguage("ko");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "ko"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.it"
          })}
          onClick={useCallback(() => {
            language.setLanguage("it");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "it"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.fr"
          })}
          onClick={useCallback(() => {
            language.setLanguage("fr");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "fr"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.ru"
          })}
          onClick={useCallback(() => {
            language.setLanguage("ru");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "ru"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.es"
          })}
          onClick={useCallback(() => {
            language.setLanguage("es");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "es"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.jp"
          })}
          onClick={useCallback(() => {
            language.setLanguage("jp");
            history.push({
              pathname: "/"
            });
          }, [history, language])}
          icons={
            !language.automatic && language.language == "jp"
              ? selectedIcon
              : undefined
          }
        />
      </div>
    </HeaderLayout>
  );
};
