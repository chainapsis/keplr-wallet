import React, { FunctionComponent, useMemo } from "react";
import { HeaderLayout } from "../../layouts";
import { useHistory } from "react-router";
import { PageButton } from "./page-button";

import style from "./style.module.scss";
import { useLanguage } from "../../languages";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";

export const SettingPage: FunctionComponent = observer(() => {
  const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();

  const paragraphLang = language.automatic
    ? intl.formatMessage(
        {
          id: "setting.language.automatic-with-language",
        },
        {
          language: intl.formatMessage({
            id: `setting.language.${language.language}`,
          }),
        }
      )
    : intl.formatMessage({
        id: `setting.language.${language.language}`,
      });

  const paragraphFiat = !language.isFiatCurrencyAutomatic
    ? language.fiatCurrency.toUpperCase()
    : intl.formatMessage(
        {
          id: "setting.fiat.automatic-with-fiat",
        },
        {
          fiat: language.fiatCurrency.toUpperCase(),
        }
      );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.settings",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.language",
          })}
          paragraph={paragraphLang}
          onClick={() => {
            history.push({
              pathname: "/setting/language",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.fiat",
          })}
          paragraph={paragraphFiat}
          onClick={() => {
            history.push({
              pathname: "/setting/fiat",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.connections",
          })}
          paragraph={intl.formatMessage({
            id: "setting.connections.paragraph",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/connections",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.export-to-mobile",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/export-to-mobile",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.credit",
          })}
          onClick={() => {
            history.push({
              pathname: "/setting/credit",
            });
          }}
          icons={useMemo(
            () => [<i key="next" className="fas fa-chevron-right" />],
            []
          )}
        />
      </div>
    </HeaderLayout>
  );
});
